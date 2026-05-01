import type { PackMeta } from "./types";
import { FRANCHISE_MAP, LANGUAGE_LABELS, REGISTRY_TAG } from "./constants";

// ── Types ───────────────────────────────────────────────────────────────────

interface ManifestSound {
  file: string;
  label?: string;
  line?: string;
  sha256?: string;
}

interface ManifestCategory {
  sounds: ManifestSound[];
}

interface Manifest {
  cesp_version?: string;
  name: string;
  display_name: string;
  version?: string;
  author?: { name: string; github: string };
  license?: string;
  language?: string;
  description?: string;
  tags?: string[];
  categories: Record<string, ManifestCategory>;
}

interface RegistryEntry {
  name: string;
  display_name: string;
  source_repo: string;
  source_ref: string;
  source_path: string;
  trust_tier?: string;
  tags?: string[];
  preview_sounds?: string[];
  quality?: "gold" | "silver" | "flagged" | "unreviewed";
  added?: string;
  updated?: string;
  franchise?: { name: string; url: string };
}

function franchiseFromTags(tags?: string[]) {
  if (!tags) return undefined;
  for (const tag of tags) {
    const match = FRANCHISE_MAP[tag.toLowerCase()];
    if (match) return match;
  }
  return undefined;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const REGISTRY_INDEX_URL = "https://peonping.github.io/registry/index.json";

const FETCH_OPTIONS = { next: { revalidate: 86400, tags: [REGISTRY_TAG] } };

interface ProcessOpts {
  packName: string;
  audioBase: string;
  trustTier?: string;
  registryTags?: string[];
  previewSoundFiles?: string[];
  sourceRepo?: string;
  sourcePath?: string;
  quality?: "gold" | "silver" | "flagged" | "unreviewed";
  dateAdded?: string;
  dateUpdated?: string;
  franchise?: { name: string; url: string };
}

function resolvePreviewSounds(
  allSounds: PackMeta["previewSounds"],
  previewSoundFiles?: string[],
) {
  if (!previewSoundFiles?.length) return [];

  const byFile = new Map(allSounds.map((sound) => [sound.file, sound]));
  const byBasename = new Map(
    allSounds
      .map((sound) => [sound.file.split("/").pop(), sound] as const)
      .filter(([name]) => !!name),
  );

  const seen = new Set<string>();
  const resolved: PackMeta["previewSounds"] = [];

  for (const file of previewSoundFiles) {
    const match = byFile.get(file) || byBasename.get(file.split("/").pop() || "");
    if (match && !seen.has(match.file)) {
      seen.add(match.file);
      resolved.push(match);
    }
  }

  return resolved;
}

function processManifest(manifest: Manifest, opts: ProcessOpts): PackMeta {
  const categories: PackMeta["categories"] = [];
  const fallbackPreviewSounds: PackMeta["previewSounds"] = [];
  let soundCount = 0;

  for (const [catName, catData] of Object.entries(manifest.categories)) {
    const sounds = (catData.sounds || []).map((s: ManifestSound) => ({
      file: s.file,
      label: s.label || s.line || s.file.split("/").pop()!,
      audioUrl: `${opts.audioBase}/${s.file}`,
    }));

    categories.push({ name: catName, sounds });
    soundCount += sounds.length;

    if (sounds.length > 0 && fallbackPreviewSounds.length < 6) {
      fallbackPreviewSounds.push(sounds[0]);
    }
  }

  const registryPreviewSounds = resolvePreviewSounds(categories.flatMap((category) => category.sounds), opts.previewSoundFiles);
  const previewSounds = registryPreviewSounds.length > 0 ? registryPreviewSounds : fallbackPreviewSounds;

  // Some community manifests ship `language` as an array (["en", "ru"]) or
  // as a non-string. Coerce to a primary string so the .split() chain
  // below never throws on bad data and dies during static-page collection.
  const rawLangValue: unknown = manifest.language;
  let rawLang = "";
  if (typeof rawLangValue === "string") {
    rawLang = rawLangValue;
  } else if (Array.isArray(rawLangValue) && typeof rawLangValue[0] === "string") {
    rawLang = rawLangValue[0];
  }
  // Normalize: "en-GB" -> "en", "zh-CN" -> "zh", "en,ru" -> "en", "" -> "unknown"
  // Keep regional variants that have their own label (e.g. "pt-BR")
  const normalizedLang = rawLang ? rawLang.split(",")[0].trim().toLowerCase() : "unknown";
  const lang = LANGUAGE_LABELS[normalizedLang] ? normalizedLang : normalizedLang.split("-")[0];
  const resolvedTags = manifest.tags?.length ? manifest.tags : opts.registryTags;

  return {
    name: opts.packName,
    displayName: manifest.display_name,
    version: manifest.version || "1.0.0",
    author: manifest.author || { name: "Unknown", github: "" },
    license: manifest.license || "CC-BY-NC-4.0",
    language: lang,
    languageLabel: LANGUAGE_LABELS[lang] || lang.toUpperCase(),
    description: manifest.description,
    tags: resolvedTags || undefined,
    trustTier: opts.trustTier || "community",
    quality: opts.quality,
    // TODO: Read franchise from registry once PeonPing/registry serves it in index.json
    franchise: opts.franchise || FRANCHISE_MAP[opts.packName] || franchiseFromTags(resolvedTags) || { name: "Unknown", url: "" },
    categories,
    categoryNames: categories.map((c) => c.name),
    totalSoundCount: soundCount,
    previewSounds,
    sourceRepo: opts.sourceRepo,
    sourcePath: opts.sourcePath,
    dateAdded: opts.dateAdded,
    dateUpdated: opts.dateUpdated,
  };
}

// ── Data fetcher ────────────────────────────────────────────────────────────

const MANIFEST_FETCH_CONCURRENCY = 12;
const MANIFEST_FETCH_RETRIES = 2;
const MANIFEST_RETRY_DELAY_MS = 400;

async function fetchManifestWithRetry(
  url: string,
): Promise<Manifest | null> {
  for (let attempt = 0; attempt <= MANIFEST_FETCH_RETRIES; attempt++) {
    try {
      const res = await fetch(url, FETCH_OPTIONS);
      if (res.ok) {
        return (await res.json()) as Manifest;
      }
      // 404 is permanent (pack moved/deleted), do not retry.
      if (res.status === 404) return null;
    } catch {
      // network error, retryable
    }
    if (attempt < MANIFEST_FETCH_RETRIES) {
      await new Promise((r) =>
        setTimeout(r, MANIFEST_RETRY_DELAY_MS * (attempt + 1)),
      );
    }
  }
  return null;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function fetchAllPacks(): Promise<PackMeta[]> {
  const res = await fetch(REGISTRY_INDEX_URL, FETCH_OPTIONS);
  if (!res.ok) {
    throw new Error(`Failed to fetch registry index: ${res.status}`);
  }
  const index: { packs: RegistryEntry[] } = await res.json();
  const entries = index.packs.filter((e) => e.quality !== "flagged");

  const resolved = await mapWithConcurrency(
    entries,
    MANIFEST_FETCH_CONCURRENCY,
    async (entry) => {
      const rawBase = `https://raw.githubusercontent.com/${entry.source_repo}/${entry.source_ref}`;
      const manifestUrl = entry.source_path
        ? `${rawBase}/${entry.source_path}/openpeon.json`
        : `${rawBase}/openpeon.json`;

      const manifest = await fetchManifestWithRetry(manifestUrl);
      if (!manifest) return null;

      // processManifest assumes well-formed manifest fields. A handful of
      // community packs ship malformed data (non-string `language`, non-string
      // sound `file`, etc.) which previously got silently dropped by
      // Promise.allSettled. Preserve that drop-rather-than-crash behavior so
      // one bad pack doesn't fail the whole build.
      try {
        // Use the registry slug as the canonical identifier; manifest.name is
        // contributor-freeform (e.g. "openpeon-elise-soundpack") and would
        // 404 the per-pack page when the route uses entry.name as the slug.
        return processManifest(manifest, {
          packName: entry.name,
          audioBase: entry.source_path ? `${rawBase}/${entry.source_path}` : rawBase,
          trustTier: entry.trust_tier,
          registryTags: entry.tags,
          previewSoundFiles: entry.preview_sounds,
          sourceRepo: entry.source_repo,
          sourcePath: entry.source_path || undefined,
          quality: entry.quality,
          dateAdded: entry.added,
          dateUpdated: entry.updated,
          franchise: entry.franchise,
        });
      } catch (err) {
        console.warn(
          `[registry] dropping pack ${entry.name} due to malformed manifest:`,
          err instanceof Error ? err.message : String(err),
        );
        return null;
      }
    },
  );

  const packs: PackMeta[] = resolved.filter(
    (p): p is PackMeta => p !== null,
  );

  packs.sort((a, b) => a.name.localeCompare(b.name));
  return packs;
}
