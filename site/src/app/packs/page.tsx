"use client";

import { useState, useMemo } from "react";
import { getAllPacks } from "@/lib/packs";
import { PackCard } from "@/components/ui/PackCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function PacksPage() {
  const allPacks = getAllPacks();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<string | null>(null);

  // Derive tag and language counts
  const { allTags, allLangs } = useMemo(() => {
    const tagCounts = new Map<string, number>();
    const langCounts = new Map<string, number>();
    for (const p of allPacks) {
      for (const t of p.tags || []) {
        tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
      }
      langCounts.set(p.language, (langCounts.get(p.language) || 0) + 1);
    }
    return {
      allTags: [...tagCounts.entries()].sort((a, b) => b[1] - a[1]),
      allLangs: [...langCounts.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [allPacks]);

  const filtered = useMemo(() => {
    let packs = allPacks;

    if (activeTag) {
      packs = packs.filter((p) => (p.tags || []).includes(activeTag));
    }
    if (activeLang) {
      packs = packs.filter((p) => p.language === activeLang);
    }
    if (query) {
      const q = query.toLowerCase();
      packs = packs.filter((pack) => {
        const haystack = [
          pack.displayName,
          pack.name,
          pack.author.name,
          pack.author.github,
          pack.franchise.name,
          pack.description,
          ...(pack.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    return packs;
  }, [allPacks, query, activeTag, activeLang]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-3xl text-text-primary mb-2">
        Sound Packs
      </h1>
      <p className="text-text-muted mb-8">
        {allPacks.length} CESP-compatible sound packs for your IDE.
      </p>

      {/* Tag pills */}
      {allTags.length > 0 && (
        <div className="flex items-start gap-3 mb-3">
          <span className="font-mono text-[11px] text-text-dim uppercase tracking-wide pt-1.5 shrink-0">
            Tags
          </span>
          <div className="flex flex-wrap gap-1.5">
            <FilterPill
              label="All"
              count={allPacks.length}
              active={!activeTag}
              onClick={() => setActiveTag(null)}
            />
            {allTags.map(([tag, count]) => (
              <FilterPill
                key={tag}
                label={tag}
                count={count}
                active={activeTag === tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Language pills */}
      {allLangs.length > 0 && (
        <div className="flex items-start gap-3 mb-4">
          <span className="font-mono text-[11px] text-text-dim uppercase tracking-wide pt-1.5 shrink-0">
            Lang
          </span>
          <div className="flex flex-wrap gap-1.5">
            <FilterPill
              label="All"
              count={allPacks.length}
              active={!activeLang}
              onClick={() => setActiveLang(null)}
              variant="lang"
            />
            {allLangs.map(([lang, count]) => (
              <FilterPill
                key={lang}
                label={lang.toUpperCase()}
                count={count}
                active={activeLang === lang}
                onClick={() =>
                  setActiveLang(activeLang === lang ? null : lang)
                }
                variant="lang"
              />
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by name, author, franchise, tag..."
        />
      </div>

      <p className="text-xs text-text-dim mb-4">
        Showing {filtered.length} of {allPacks.length} packs
      </p>

      <ErrorBoundary>
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((pack) => (
              <PackCard key={pack.name} pack={pack} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-surface-border bg-surface-card p-12 text-center">
            <p className="text-text-muted">
              No packs found matching your filters.
            </p>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}

// ── Filter pill component ────────────────────────────────────────────────────

const PILL_INACTIVE_STYLES = {
  default: "border-surface-border text-text-dim hover:border-gold/50 hover:text-text-muted",
  lang: "border-amber-700/50 text-amber-500/70 hover:border-gold/50 hover:text-gold uppercase",
};

function FilterPill({
  label,
  count,
  active,
  onClick,
  variant = "default",
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  variant?: "default" | "lang";
}) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-xs px-2.5 py-1 rounded-full border transition-colors ${
        active
          ? "border-gold text-gold bg-gold/10"
          : PILL_INACTIVE_STYLES[variant]
      }`}
    >
      {label}{" "}
      <span className="opacity-50">{count}</span>
    </button>
  );
}
