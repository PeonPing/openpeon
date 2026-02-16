"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AudioPlayer, useAudio } from "@/components/ui/AudioPlayer";
import { CESP_CATEGORIES } from "@/lib/categories";
import { CategoryBadge } from "@/components/ui/CategoryBadge";

// ── Types ────────────────────────────────────────────────────────────────────

interface ManifestSound {
  file: string;
  label?: string;
}

interface ManifestCategory {
  sounds: ManifestSound[];
}

interface PackManifest {
  name: string;
  display_name?: string;
  version?: string;
  author?: { name: string; github?: string };
  language?: string;
  categories: Record<string, ManifestCategory>;
}

interface RegistryPack {
  name: string;
  display_name?: string;
  source_repo: string;
  source_path?: string;
  categories?: string[];
  pending?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export function PreviewClient() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manifest, setManifest] = useState<PackManifest | null>(null);
  const [audioBase, setAudioBase] = useState("");
  const [resolvedRepo, setResolvedRepo] = useState("");

  // Tour (Play All) state
  const [touring, setTouring] = useState(false);
  const [touringCategory, setTouringCategory] = useState<string | null>(null);
  const tourAbortRef = useRef(false);
  const currentIdRef = useRef<string | null>(null);
  const { play, stop: stopAudio, currentId } = useAudio();

  // Keep ref in sync with currentId so the tour can read it
  useEffect(() => {
    currentIdRef.current = currentId;
  }, [currentId]);

  // Autocomplete state
  const [registry, setRegistry] = useState<RegistryPack[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load registry + pending PRs for autocomplete
  useEffect(() => {
    async function load() {
      // Accepted packs
      const accepted: RegistryPack[] = [];
      try {
        const data = await fetch(
          "https://peonping.github.io/registry/index.json"
        ).then((r) => (r.ok ? r.json() : { packs: [] }));
        for (const p of data.packs || data || []) {
          accepted.push({ ...p, pending: false });
        }
      } catch {}

      // Pending PRs
      const pending: RegistryPack[] = [];
      try {
        const prs = await fetch(
          "https://api.github.com/repos/PeonPing/registry/pulls?state=open&per_page=50"
        ).then((r) => (r.ok ? r.json() : []));
        for (const pr of prs) {
          try {
            const filesRes = await fetch(
              `https://api.github.com/repos/PeonPing/registry/pulls/${pr.number}/files`
            );
            if (!filesRes.ok) continue;
            const files: { filename: string; patch?: string }[] =
              await filesRes.json();
            const indexFile = files.find(
              (f: { filename: string }) => f.filename === "index.json"
            );
            if (!indexFile?.patch) continue;
            const repoMatch = indexFile.patch.match(
              /"source_repo"\s*:\s*"([^"]+)"/
            );
            const pathMatch = indexFile.patch.match(
              /"source_path"\s*:\s*"([^"]+)"/
            );
            const nameMatch =
              indexFile.patch.match(/"display_name"\s*:\s*"([^"]+)"/) ||
              indexFile.patch.match(/"name"\s*:\s*"([^"]+)"/);
            if (!repoMatch) continue;
            pending.push({
              name: nameMatch ? nameMatch[1] : pr.title,
              display_name: nameMatch ? nameMatch[1] : pr.title,
              source_repo: repoMatch[1],
              source_path: pathMatch ? pathMatch[1] : undefined,
              pending: true,
            });
          } catch {}
        }
      } catch {}

      setRegistry([...pending, ...accepted]);
    }
    load();
  }, []);

  // Load from URL hash
  useEffect(() => {
    if (window.location.hash) {
      const repo = decodeURIComponent(window.location.hash.slice(1));
      setInput(repo);
      loadPack(repo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = input.trim()
    ? registry.filter(
        (p) =>
          (p.display_name || p.name).toLowerCase().includes(input.toLowerCase()) ||
          p.source_repo.toLowerCase().includes(input.toLowerCase())
      )
    : registry;

  const loadPack = useCallback(async (raw?: string) => {
    const val = (raw || input).trim();
    if (!val) return;

    // Parse input: accept full URL, owner/repo, or owner/repo/subpath
    let repo = val;
    const ghMatch = val.match(/github\.com\/([^/]+\/[^/]+)/);
    if (ghMatch) repo = ghMatch[1].replace(/\.git$/, "");

    const segments = repo.split("/");
    const ownerRepo = segments.slice(0, 2).join("/");
    const subpath = segments.slice(2).join("/");

    setLoading(true);
    setError(null);
    setManifest(null);
    setShowDropdown(false);

    // Update URL hash
    window.location.hash = encodeURIComponent(
      subpath ? ownerRepo + "/" + subpath : ownerRepo
    );

    const manifestPath = subpath
      ? `${subpath}/openpeon.json`
      : "openpeon.json";

    let found: { manifest: PackManifest; branch: string } | null = null;
    for (const ref of ["main", "master"]) {
      try {
        const res = await fetch(
          `https://raw.githubusercontent.com/${ownerRepo}/${ref}/${manifestPath}`
        );
        if (res.ok) {
          found = { manifest: await res.json(), branch: ref };
          break;
        }
      } catch {
        // Try next branch
      }
    }

    if (!found) {
      setError(
        `Could not load openpeon.json from ${ownerRepo}${subpath ? "/" + subpath : ""}`
      );
      setLoading(false);
      return;
    }

    const base = `https://raw.githubusercontent.com/${ownerRepo}/${found.branch}${subpath ? "/" + subpath : ""}`;
    setManifest(found.manifest);
    setAudioBase(base);
    setResolvedRepo(subpath ? ownerRepo + "/" + subpath : ownerRepo);
    setLoading(false);
  }, [input]);

  const selectPack = (pack: RegistryPack) => {
    const fullPath = pack.source_path
      ? pack.source_repo + "/" + pack.source_path
      : pack.source_repo;
    setInput(fullPath);
    setShowDropdown(false);
    loadPack(fullPath);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (highlightIdx >= 0 && filtered[highlightIdx]) {
        selectPack(filtered[highlightIdx]);
      } else {
        loadPack();
      }
      e.preventDefault();
      return;
    }
    if (e.key === "Escape") {
      setShowDropdown(false);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!filtered.length) return;
      if (e.key === "ArrowDown") {
        setHighlightIdx((i) => (i + 1) % filtered.length);
      } else {
        setHighlightIdx((i) => (i <= 0 ? filtered.length - 1 : i - 1));
      }
    }
  };

  // Build category sections from manifest
  const allCategoryKeys = Object.keys(CESP_CATEGORIES);
  const categories = manifest?.categories || {};

  // Play All tour
  const startTour = useCallback(async () => {
    if (!manifest || !audioBase) return;
    tourAbortRef.current = false;
    setTouring(true);

    const delay = (ms: number) =>
      new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, ms);
        const check = setInterval(() => {
          if (tourAbortRef.current) {
            clearTimeout(timer);
            clearInterval(check);
            resolve();
          }
        }, 100);
      });

    for (const catKey of allCategoryKeys) {
      if (tourAbortRef.current) break;
      const sounds = manifest.categories[catKey]?.sounds || [];
      if (!sounds.length) continue;

      setTouringCategory(catKey);
      await delay(500);

      for (let idx = 0; idx < sounds.length; idx++) {
        if (tourAbortRef.current) break;
        const sound = sounds[idx];
        const url = `${audioBase}/${sound.file}`;
        const id = `preview-${catKey}-${idx}`;

        play(url, id);

        // Wait for this sound to finish by polling currentId ref
        await new Promise<void>((resolve) => {
          // Small initial delay to let the audio start
          setTimeout(() => {
            const check = setInterval(() => {
              if (tourAbortRef.current) {
                clearInterval(check);
                resolve();
                return;
              }
              // Sound finished when currentId is no longer our id
              if (currentIdRef.current !== id) {
                clearInterval(check);
                resolve();
              }
            }, 150);
          }, 300);
        });

        // Gap between sounds
        if (!tourAbortRef.current) {
          await delay(500);
        }
      }

      // Pause between categories
      if (!tourAbortRef.current) {
        await delay(800);
      }
    }

    setTouring(false);
    setTouringCategory(null);
  }, [manifest, audioBase, allCategoryKeys, play]);

  const stopTour = useCallback(() => {
    tourAbortRef.current = true;
    stopAudio();
    setTouring(false);
    setTouringCategory(null);
  }, [stopAudio]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-3xl text-text-primary mb-2">
        Pack Preview
      </h1>
      <p className="text-text-muted mb-8">
        Test any CESP sound pack from a GitHub repo.
      </p>

      {/* Input bar */}
      <div className="relative mb-8">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowDropdown(!showDropdown);
              inputRef.current?.focus();
            }}
            className="flex-shrink-0 rounded-lg border border-surface-border bg-surface-card px-3 py-2.5 text-sm text-text-muted hover:border-gold/50 hover:text-gold transition-colors"
            aria-label="Browse packs"
          >
            &#9660;
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowDropdown(true);
              setHighlightIdx(-1);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder="owner/repo or paste a GitHub URL"
            className="flex-1 rounded-lg border border-surface-border bg-surface-card px-3 py-2.5 text-sm text-text-body placeholder:text-text-dim focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
          />
          <button
            onClick={() => loadPack()}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 rounded-lg border border-surface-border bg-surface-card px-5 py-2.5 text-sm font-medium text-text-muted hover:border-gold/50 hover:text-gold transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            Load
          </button>
        </div>

        {/* Autocomplete dropdown */}
        {showDropdown && filtered.length > 0 && (() => {
          const pendingItems = filtered.filter((p) => p.pending);
          const acceptedItems = filtered.filter((p) => !p.pending);
          let globalIdx = 0;

          const renderItem = (pack: RegistryPack) => {
            const idx = globalIdx++;
            const fullPath = pack.source_path
              ? pack.source_repo + "/" + pack.source_path
              : pack.source_repo;
            return (
              <button
                key={fullPath}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectPack(pack);
                }}
                className={`w-full text-left px-3 py-2.5 border-b border-surface-border last:border-b-0 transition-colors ${
                  idx === highlightIdx
                    ? "bg-gold-glow"
                    : "hover:bg-surface-bg/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-primary">
                    {pack.display_name || pack.name}
                  </span>
                  {pack.pending && (
                    <span className="text-[10px] font-semibold text-gold">
                      PENDING
                    </span>
                  )}
                </div>
                <div className="font-mono text-[11px] text-text-dim">
                  {fullPath}
                </div>
                {pack.categories && pack.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {pack.categories.map((c) => (
                      <CategoryBadge key={c} name={c} size="xs" />
                    ))}
                  </div>
                )}
              </button>
            );
          };

          return (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-1 max-h-80 overflow-y-auto rounded-lg border border-surface-border bg-surface-card z-20"
            >
              {pendingItems.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-gold bg-surface-bg/50 border-b border-surface-border">
                    Pending
                  </div>
                  {pendingItems.map(renderItem)}
                </>
              )}
              {acceptedItems.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-text-dim bg-surface-bg/50 border-b border-surface-border">
                    Accepted
                  </div>
                  {acceptedItems.map(renderItem)}
                </>
              )}
            </div>
          );
        })()}

        <p className="text-xs text-text-dim mt-2 text-center">
          Enter a GitHub repo path, paste a URL, or browse packs with &#9660;
        </p>
      </div>

      {/* Status */}
      {loading && (
        <div className="rounded-lg border border-surface-border bg-surface-card p-12 text-center mb-8">
          <p className="text-text-muted">Loading manifest...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-surface-border bg-surface-card p-12 text-center mb-8">
          <p className="text-text-dim">{error}</p>
        </div>
      )}

      {/* Pack header */}
      {manifest && (
        <>
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl text-text-primary mb-1">
              {manifest.display_name || manifest.name}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-text-muted">
              {manifest.version && (
                <span className="font-mono">v{manifest.version}</span>
              )}
              {manifest.author?.name && (
                <span>
                  by{" "}
                  <a
                    href={`https://github.com/${manifest.author.github || manifest.author.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold transition-colors"
                  >
                    {manifest.author.name}
                  </a>
                </span>
              )}
              {manifest.language && (
                <span className="rounded-full bg-surface-border px-2 py-0.5 text-[10px] font-mono text-text-muted uppercase">
                  {manifest.language}
                </span>
              )}
              <span>
                {Object.values(categories).reduce(
                  (sum, cat) => sum + (cat.sounds?.length || 0),
                  0
                )}{" "}
                sounds
              </span>
              {(() => {
                const formats = new Set<string>();
                for (const cat of Object.values(categories)) {
                  for (const s of cat.sounds || []) {
                    const ext = s.file.split(".").pop()?.toLowerCase();
                    if (ext) formats.add(ext);
                  }
                }
                return formats.size > 0 ? (
                  <span className="rounded-full bg-surface-border px-2 py-0.5 text-[10px] font-mono text-text-muted uppercase">
                    {[...formats].join(" / ")}
                  </span>
                ) : null;
              })()}
              <a
                href={`https://github.com/${resolvedRepo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono hover:text-gold transition-colors"
              >
                {resolvedRepo}
              </a>
            </div>
          </div>

          {/* Play All button */}
          <div className="text-center mb-8">
            <button
              onClick={touring ? stopTour : startTour}
              className={`rounded-lg border px-5 py-2 text-sm font-medium transition-all duration-200 ${
                touring
                  ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
                  : "border-surface-border text-text-muted hover:border-gold/50 hover:text-gold"
              }`}
            >
              {touring ? "Stop" : "Play All"}
            </button>
          </div>

          {/* Category grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCategoryKeys.map((catKey) => {
              const catInfo = CESP_CATEGORIES[catKey];
              const catData = categories[catKey];
              const sounds = catData?.sounds || [];

              return (
                <div
                  key={catKey}
                  className={`rounded-lg border bg-surface-card p-4 transition-all duration-300 ${
                    touringCategory === catKey
                      ? "border-gold shadow-[0_0_12px_rgba(255,171,1,0.3)]"
                      : sounds.length > 0
                        ? "border-surface-border"
                        : "border-surface-border/50 opacity-50"
                  }`}
                >
                  <div className="font-mono text-xs font-semibold text-gold mb-0.5">
                    {catKey}
                  </div>
                  <div className="text-xs text-text-dim mb-1">
                    {catInfo.description}
                  </div>
                  <div
                    className={`text-[10px] uppercase tracking-wider mb-3 ${
                      catInfo.tier === "core"
                        ? "text-gold"
                        : "text-text-dim"
                    }`}
                  >
                    {catInfo.tier === "core" ? "core" : "extended"}
                  </div>

                  {sounds.length === 0 ? (
                    <p className="text-xs text-text-dim italic">No sounds</p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {sounds.map((sound, idx) => (
                        <AudioPlayer
                          key={`${catKey}-${idx}`}
                          url={`${audioBase}/${sound.file}`}
                          label={
                            sound.label ||
                            sound.file.split("/").pop() ||
                            sound.file
                          }
                          id={`preview-${catKey}-${idx}`}
                          compact
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
