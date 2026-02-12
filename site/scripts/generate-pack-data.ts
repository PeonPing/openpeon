import * as fs from "fs";
import * as path from "path";

// ── Franchise lookup ────────────────────────────────────────────────────────
interface Franchise {
  name: string;
  url: string;
}

const FRANCHISE_MAP: Record<string, Franchise> = {
  peon: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peon_es: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peon_fr: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peon_cz: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peon_pl: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peon_ru: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peasant: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peasant_cz: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peasant_es: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peasant_fr: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peasant_ru: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  acolyte_ru: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  brewmaster_ru: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peon_de: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  acolyte_de: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  murloc: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  wc2_peasant: { name: "Warcraft II", url: "https://liquipedia.net/warcraft/Warcraft_II" },
  wc2_sapper: { name: "Warcraft II", url: "https://liquipedia.net/warcraft/Warcraft_II" },
  wc2_sappers: { name: "Warcraft II", url: "https://liquipedia.net/warcraft/Warcraft_II" },
  ocarina_of_time: { name: "The Legend of Zelda", url: "https://zelda.nintendo.com" },
  sc_kerrigan: { name: "StarCraft", url: "https://liquipedia.net/starcraft/StarCraft" },
  sc_battlecruiser: { name: "StarCraft", url: "https://liquipedia.net/starcraft/StarCraft" },
  sc_terran: { name: "StarCraft", url: "https://liquipedia.net/starcraft/StarCraft" },
  sc_scv: { name: "StarCraft", url: "https://liquipedia.net/starcraft/StarCraft" },
  sc_firebat: { name: "StarCraft", url: "https://liquipedia.net/starcraft/StarCraft" },
  sc_medic: { name: "StarCraft", url: "https://liquipedia.net/starcraft/StarCraft" },
  sc_tank: { name: "StarCraft", url: "https://liquipedia.net/starcraft/StarCraft" },
  sc_vessel: { name: "StarCraft", url: "https://liquipedia.net/starcraft/StarCraft" },
  ra2_kirov: { name: "Command & Conquer: Red Alert 2", url: "https://www.ea.com/games/command-and-conquer" },
  ra2_soviet_engineer: { name: "Command & Conquer: Red Alert 2", url: "https://www.ea.com/games/command-and-conquer" },
  ra_soviet: { name: "Command & Conquer: Red Alert", url: "https://www.ea.com/games/command-and-conquer" },
  glados: { name: "Portal", url: "https://store.steampowered.com/app/400/Portal/" },
  tf2_engineer: { name: "Team Fortress 2", url: "https://store.steampowered.com/app/440/Team_Fortress_2/" },
  rick: { name: "Rick and Morty", url: "https://en.wikipedia.org/wiki/Rick_and_Morty" },
  sopranos: { name: "The Sopranos", url: "https://en.wikipedia.org/wiki/The_Sopranos" },
  dota2_axe: { name: "Dota 2", url: "https://www.dota2.com" },
  hd2_helldiver: { name: "Helldivers 2", url: "https://store.steampowered.com/app/553850/HELLDIVERS_2/" },
  molag_bal: { name: "The Elder Scrolls", url: "https://elderscrolls.bethesda.net" },
  sheogorath: { name: "The Elder Scrolls", url: "https://elderscrolls.bethesda.net" },
  duke_nukem: { name: "Duke Nukem", url: "https://en.wikipedia.org/wiki/Duke_Nukem" },
  aoe2: { name: "Age of Empires II", url: "https://www.ageofempires.com" },
  aom_greek: { name: "Age of Mythology", url: "https://www.ageofempires.com/games/aom/" },
};

// ── Language labels ─────────────────────────────────────────────────────────
const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  cs: "Czech",
  pl: "Polish",
  ru: "Russian",
  el: "Greek",
};

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
}

interface PackData {
  name: string;
  displayName: string;
  version: string;
  author: { name: string; github: string };
  license: string;
  language: string;
  languageLabel: string;
  description?: string;
  tags?: string[];
  franchise: Franchise;
  categories: { name: string; sounds: { file: string; label: string; audioUrl: string }[] }[];
  categoryNames: string[];
  totalSoundCount: number;
  previewSounds: { file: string; label: string; audioUrl: string }[];
}

// ── Config ──────────────────────────────────────────────────────────────────
const SITE_DIR = path.resolve(__dirname, "..");
const PACKS_SOURCE =
  process.env.PACKS_SOURCE_DIR ||
  path.resolve(SITE_DIR, "../../og-packs");
const OUTPUT_JSON = path.join(SITE_DIR, "src/data/packs-data.json");

const OG_PACKS_RAW_BASE =
  process.env.OG_PACKS_RAW_BASE ||
  "https://raw.githubusercontent.com/PeonPing/og-packs/v1.0.0";

const REGISTRY_INDEX_URL =
  process.env.REGISTRY_INDEX_URL ||
  "https://peonping.github.io/registry/index.json";

// ── Helpers ─────────────────────────────────────────────────────────────────
// audioBase should be the URL of the directory containing sounds/
// e.g. "https://raw.../og-packs/v1.0.0/peon" or "https://raw.../mypack/v1.0.0"
function processManifest(manifest: Manifest, packName: string, audioBase: string): PackData {
  const categories: PackData["categories"] = [];
  const previewSounds: PackData["previewSounds"] = [];
  let soundCount = 0;

  for (const [catName, catData] of Object.entries(manifest.categories)) {
    const sounds = (catData.sounds || []).map((s: ManifestSound) => {
      const filename = path.basename(s.file);
      return {
        file: s.file,
        label: s.label || s.line || filename,
        audioUrl: `${audioBase}/sounds/${filename}`,
      };
    });

    categories.push({ name: catName, sounds });
    soundCount += sounds.length;

    if (sounds.length > 0 && previewSounds.length < 6) {
      previewSounds.push(sounds[0]);
    }
  }

  const lang = manifest.language || "en";

  return {
    name: packName,
    displayName: manifest.display_name,
    version: manifest.version || "1.0.0",
    author: manifest.author || { name: "Unknown", github: "" },
    license: manifest.license || "CC-BY-NC-4.0",
    language: lang,
    languageLabel: LANGUAGE_LABELS[lang] || lang,
    description: manifest.description,
    tags: manifest.tags,
    franchise: FRANCHISE_MAP[packName] || { name: "Unknown", url: "" },
    categories,
    categoryNames: categories.map((c) => c.name),
    totalSoundCount: soundCount,
    previewSounds,
  };
}

// ── Local mode: read manifests from filesystem ──────────────────────────────
function generateFromLocal(): PackData[] {
  console.log(`[generate] Reading packs from local: ${PACKS_SOURCE}`);

  const packDirs = fs
    .readdirSync(PACKS_SOURCE, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const packs: PackData[] = [];

  for (const dir of packDirs) {
    const packDir = path.join(PACKS_SOURCE, dir);

    let manifestPath: string | null = null;
    for (const mname of ["openpeon.json", "manifest.json"]) {
      const p = path.join(packDir, mname);
      if (fs.existsSync(p)) {
        manifestPath = p;
        break;
      }
    }
    if (!manifestPath) continue;

    const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const packName = manifest.name || dir;
    // audioBase = repo root + pack directory (og-packs monorepo layout)
    packs.push(processManifest(manifest, packName, `${OG_PACKS_RAW_BASE}/${packName}`));
  }

  return packs;
}

// ── Remote mode: fetch manifests from GitHub via registry ───────────────────
async function generateFromRemote(): Promise<PackData[]> {
  console.log(`[generate] Fetching pack list from registry: ${REGISTRY_INDEX_URL}`);

  const indexRes = await fetch(REGISTRY_INDEX_URL);
  if (!indexRes.ok) {
    throw new Error(`Failed to fetch registry index: ${indexRes.status}`);
  }
  const index: { packs: RegistryEntry[] } = await indexRes.json();

  console.log(`[generate] Found ${index.packs.length} packs in registry`);

  const packs: PackData[] = [];

  // Fetch manifests in parallel (batches of 10)
  const entries = index.packs;
  const batchSize = 10;

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (entry) => {
        const rawBase = `https://raw.githubusercontent.com/${entry.source_repo}/${entry.source_ref}`;
        const manifestUrl = entry.source_path
          ? `${rawBase}/${entry.source_path}/openpeon.json`
          : `${rawBase}/openpeon.json`;

        const res = await fetch(manifestUrl);
        if (!res.ok) {
          console.warn(`[generate] Failed to fetch manifest for ${entry.name}: ${res.status}`);
          return null;
        }

        const manifest: Manifest = await res.json();
        const packName = manifest.name || entry.name;

        // audioBase = directory containing sounds/
        // og-packs monorepo: rawBase/packDir  (e.g. .../og-packs/v1.0.0/peon)
        // standalone repo:   rawBase           (e.g. .../mypack/v1.0.0)
        const audioBase = entry.source_path
          ? `${rawBase}/${entry.source_path}`
          : rawBase;

        return processManifest(manifest, packName, audioBase);
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        packs.push(result.value);
      }
    }
  }

  packs.sort((a, b) => a.name.localeCompare(b.name));
  return packs;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const useLocal = fs.existsSync(PACKS_SOURCE);
  const packs = useLocal ? generateFromLocal() : await generateFromRemote();

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  const output = {
    generatedAt: new Date().toISOString(),
    packs,
  };
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));

  const mode = useLocal ? "local" : "remote (GitHub)";
  console.log(
    `[generate] Done: ${packs.length} packs from ${mode}`
  );
}

main().catch((err) => {
  console.error("[generate] Fatal error:", err);
  process.exit(1);
});
