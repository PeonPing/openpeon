"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAllPacks, getGeneratedAt } from "@/lib/packs";
import { PackCard } from "@/components/ui/PackCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

// ── Constants ────────────────────────────────────────────────────────────────

const PACKS_PER_PAGE = 24;

type SortKey = "name-asc" | "name-desc" | "sounds-desc" | "sounds-asc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name-asc", label: "A → Z" },
  { value: "name-desc", label: "Z → A" },
  { value: "sounds-desc", label: "Most sounds" },
  { value: "sounds-asc", label: "Fewest sounds" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function sortPacks(packs: ReturnType<typeof getAllPacks>, key: SortKey) {
  const sorted = [...packs];
  switch (key) {
    case "name-asc":
      return sorted.sort((a, b) => a.displayName.localeCompare(b.displayName));
    case "name-desc":
      return sorted.sort((a, b) => b.displayName.localeCompare(a.displayName));
    case "sounds-desc":
      return sorted.sort((a, b) => b.totalSoundCount - a.totalSoundCount);
    case "sounds-asc":
      return sorted.sort((a, b) => a.totalSoundCount - b.totalSoundCount);
    default:
      return sorted;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export function PacksClient() {
  const allPacks = getAllPacks();
  const generatedAt = getGeneratedAt();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial state from URL
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeTag, setActiveTag] = useState<string | null>(
    searchParams.get("tag") || null
  );
  const [activeLang, setActiveLang] = useState<string | null>(
    searchParams.get("lang") || null
  );
  const [sortKey, setSortKey] = useState<SortKey>(
    (searchParams.get("sort") as SortKey) || "name-asc"
  );
  const [page, setPage] = useState(
    Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
  );

  // Sync state → URL
  const updateUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(overrides)) {
        if (v) {
          params.set(k, v);
        } else {
          params.delete(k);
        }
      }
      // Clean defaults
      if (params.get("sort") === "name-asc") params.delete("sort");
      if (params.get("page") === "1") params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "/packs", { scroll: false });
    },
    [searchParams, router]
  );

  // Wrapped setters that also update URL
  const handleSetQuery = useCallback(
    (q: string) => {
      setQuery(q);
      setPage(1);
      updateUrl({ q: q || null, page: null });
    },
    [updateUrl]
  );

  const handleSetTag = useCallback(
    (tag: string | null) => {
      setActiveTag(tag);
      setPage(1);
      updateUrl({ tag, page: null });
    },
    [updateUrl]
  );

  const handleSetLang = useCallback(
    (lang: string | null) => {
      setActiveLang(lang);
      setPage(1);
      updateUrl({ lang, page: null });
    },
    [updateUrl]
  );

  const handleSetSort = useCallback(
    (sort: SortKey) => {
      setSortKey(sort);
      setPage(1);
      updateUrl({ sort: sort === "name-asc" ? null : sort, page: null });
    },
    [updateUrl]
  );

  const handleSetPage = useCallback(
    (p: number) => {
      setPage(p);
      updateUrl({ page: p === 1 ? null : String(p) });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [updateUrl]
  );

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

  // Filter + sort
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

    return sortPacks(packs, sortKey);
  }, [allPacks, query, activeTag, activeLang, sortKey]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PACKS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedPacks = filtered.slice(
    (safePage - 1) * PACKS_PER_PAGE,
    safePage * PACKS_PER_PAGE
  );

  // Reset page if it exceeds total after filter change
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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
              onClick={() => handleSetTag(null)}
            />
            {allTags.map(([tag, count]) => (
              <FilterPill
                key={tag}
                label={tag}
                count={count}
                active={activeTag === tag}
                onClick={() =>
                  handleSetTag(activeTag === tag ? null : tag)
                }
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
              onClick={() => handleSetLang(null)}
              variant="lang"
            />
            {allLangs.map(([lang, count]) => (
              <FilterPill
                key={lang}
                label={lang.toUpperCase()}
                count={count}
                active={activeLang === lang}
                onClick={() =>
                  handleSetLang(activeLang === lang ? null : lang)
                }
                variant="lang"
              />
            ))}
          </div>
        </div>
      )}

      {/* Search + Sort */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <SearchInput
            value={query}
            onChange={handleSetQuery}
            placeholder="Search by name, author, franchise, tag..."
          />
        </div>
        <select
          value={sortKey}
          onChange={(e) => handleSetSort(e.target.value as SortKey)}
          className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm text-text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between text-xs text-text-dim mb-4">
        <p>
          Showing {(safePage - 1) * PACKS_PER_PAGE + 1}–
          {Math.min(safePage * PACKS_PER_PAGE, filtered.length)} of{" "}
          {filtered.length} packs
        </p>
        <p>
          Last updated{" "}
          {new Date(generatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      <ErrorBoundary>
        {paginatedPacks.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedPacks.map((pack) => (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => handleSetPage(safePage - 1)}
            disabled={safePage <= 1}
            className="rounded-lg border border-surface-border bg-surface-card px-3 py-1.5 text-sm text-text-muted hover:border-gold/50 hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            &larr; Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => handleSetPage(p)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-mono transition-colors ${
                p === safePage
                  ? "border-gold text-gold bg-gold/10"
                  : "border-surface-border text-text-dim hover:border-gold/50 hover:text-text-muted"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => handleSetPage(safePage + 1)}
            disabled={safePage >= totalPages}
            className="rounded-lg border border-surface-border bg-surface-card px-3 py-1.5 text-sm text-text-muted hover:border-gold/50 hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}

// ── Filter pill component ────────────────────────────────────────────────────

const PILL_INACTIVE_STYLES = {
  default:
    "border-surface-border text-text-dim hover:border-gold/50 hover:text-text-muted",
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
