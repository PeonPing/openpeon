"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  startTransition,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { PackMeta } from "@/lib/types";
import { LANGUAGE_LABELS } from "@/lib/constants";
import { PackCard } from "@/components/ui/PackCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

// ── Constants ────────────────────────────────────────────────────────────────

const PACKS_PER_PAGE = 24;

type SortKey =
  | "name-asc"
  | "name-desc"
  | "sounds-desc"
  | "sounds-asc"
  | "date-desc"
  | "date-asc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name-asc", label: "A → Z" },
  { value: "name-desc", label: "Z → A" },
  { value: "sounds-desc", label: "Most sounds" },
  { value: "sounds-asc", label: "Fewest sounds" },
  { value: "date-desc", label: "Newest" },
  { value: "date-asc", label: "Oldest" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function sortPacks(packs: PackMeta[], key: SortKey) {
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
    case "date-desc":
      return sorted.sort((a, b) => {
        if (!a.dateAdded && !b.dateAdded) return 0;
        if (!a.dateAdded) return 1;
        if (!b.dateAdded) return -1;
        return b.dateAdded.localeCompare(a.dateAdded);
      });
    case "date-asc":
      return sorted.sort((a, b) => {
        if (!a.dateAdded && !b.dateAdded) return 0;
        if (!a.dateAdded) return 1;
        if (!b.dateAdded) return -1;
        return a.dateAdded.localeCompare(b.dateAdded);
      });
    default:
      return sorted;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export function PacksClient({ packs: allPacks }: { packs: PackMeta[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial state from URL
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeTag, setActiveTag] = useState<string | null>(
    searchParams.get("tag") || null,
  );
  const [activeLang, setActiveLang] = useState<string | null>(
    searchParams.get("lang") || null,
  );
  const [activeFranchise, setActiveFranchise] = useState<string | null>(
    searchParams.get("franchise") || null,
  );
  const [sortKey, setSortKey] = useState<SortKey>(
    (searchParams.get("sort") as SortKey) || "date-desc",
  );
  const [page, setPage] = useState(
    Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1),
  );
  const [expandedFilter, setExpandedFilter] = useState<
    "franchises" | "tags" | "langs" | null
  >(null);
  const gridRef = useRef<HTMLDivElement>(null);

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
      if (params.get("sort") === "date-desc") params.delete("sort");
      if (params.get("page") === "1") params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "/packs", { scroll: false });
    },
    [searchParams, router],
  );

  // Wrapped setters that also update URL
  const handleSetQuery = useCallback(
    (q: string) => {
      setQuery(q);
      setPage(1);
      updateUrl({ q: q || null, page: null });
    },
    [updateUrl],
  );

  const handleSetTag = useCallback(
    (tag: string | null) => {
      setActiveTag(tag);
      setPage(1);
      updateUrl({ tag, page: null });
    },
    [updateUrl],
  );

  const handleSetLang = useCallback(
    (lang: string | null) => {
      setActiveLang(lang);
      setPage(1);
      updateUrl({ lang, page: null });
    },
    [updateUrl],
  );

  const handleSetFranchise = useCallback(
    (franchise: string | null) => {
      setActiveFranchise(franchise);
      setPage(1);
      updateUrl({ franchise, page: null });
    },
    [updateUrl],
  );

  const handleSetSort = useCallback(
    (sort: SortKey) => {
      setSortKey(sort);
      setPage(1);
      updateUrl({ sort: sort === "date-desc" ? null : sort, page: null });
    },
    [updateUrl],
  );

  const handleSetPage = useCallback(
    (p: number) => {
      setPage(p);
      updateUrl({ page: p === 1 ? null : String(p) });
      gridRef.current?.scrollIntoView({ behavior: "smooth" });
    },
    [updateUrl],
  );

  // Derive tag, language, and franchise counts
  const { allTags, allLangs, allFranchises } = useMemo(() => {
    const tagCounts = new Map<string, number>();
    const langCounts = new Map<string, number>();
    const franchiseCounts = new Map<string, number>();
    for (const p of allPacks) {
      for (const t of p.tags || []) {
        tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
      }
      langCounts.set(p.language, (langCounts.get(p.language) || 0) + 1);
      if (p.franchise.name && p.franchise.name !== "Unknown") {
        franchiseCounts.set(
          p.franchise.name,
          (franchiseCounts.get(p.franchise.name) || 0) + 1,
        );
      }
    }
    return {
      allTags: [...tagCounts.entries()].sort((a, b) => b[1] - a[1]),
      allLangs: [...langCounts.entries()].sort((a, b) => b[1] - a[1]),
      allFranchises: [...franchiseCounts.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [allPacks]);

  const tagsRef = useRef<HTMLDivElement>(null);
  const langsRef = useRef<HTMLDivElement>(null);
  const franchisesRef = useRef<HTMLDivElement>(null);
  const [tagsOverflow, setTagsOverflow] = useState(false);
  const [langsOverflow, setLangsOverflow] = useState(false);
  const [franchisesOverflow, setFranchisesOverflow] = useState(false);

  useEffect(() => {
    const check = () => {
      if (tagsRef.current)
        setTagsOverflow(
          tagsRef.current.scrollHeight > tagsRef.current.clientHeight,
        );
      if (langsRef.current)
        setLangsOverflow(
          langsRef.current.scrollHeight > langsRef.current.clientHeight,
        );
      if (franchisesRef.current)
        setFranchisesOverflow(
          franchisesRef.current.scrollHeight >
            franchisesRef.current.clientHeight,
        );
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [allTags, allLangs, allFranchises]);

  // Filter + sort
  const filtered = useMemo(() => {
    let packs = allPacks;

    if (activeTag) {
      packs = packs.filter((p) => (p.tags || []).includes(activeTag));
    }
    if (activeLang) {
      packs = packs.filter((p) => p.language === activeLang);
    }
    if (activeFranchise) {
      packs = packs.filter((p) => p.franchise.name === activeFranchise);
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
  }, [allPacks, query, activeTag, activeLang, activeFranchise, sortKey]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PACKS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedPacks = filtered.slice(
    (safePage - 1) * PACKS_PER_PAGE,
    safePage * PACKS_PER_PAGE,
  );

  // Reset page if it exceeds total after filter change
  useEffect(() => {
    if (page > totalPages) {
      startTransition(() => setPage(totalPages));
    }
  }, [page, totalPages]);

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-6 py-12">
      <h1 className="font-display text-3xl text-text-primary mb-2">
        Sound Packs
      </h1>
      <p className="text-text-muted mb-8">
        {allPacks.length} CESP-compatible sound packs for your IDE.
      </p>

      {/* Filters — expanded goes full-width, others share a row */}
      <div
        className={`grid grid-cols-1 gap-3 mb-4 ${expandedFilter ? "md:grid-cols-2" : "md:grid-cols-3"}`}
      >
        {/* Franchise pills */}
        {allFranchises.length > 0 && (
          <div
            className={
              expandedFilter === "franchises"
                ? "md:col-span-2 md:order-first"
                : expandedFilter
                  ? "md:order-last"
                  : ""
            }
          >
            <span className="font-mono text-[11px] text-text-dim uppercase tracking-wide mb-1.5 block">
              Franchises{" "}
              <span className="text-text-dim/50">({allFranchises.length})</span>
            </span>
            <div className="relative">
              <div
                ref={franchisesRef}
                className={`flex flex-wrap gap-1.5 rounded-lg border border-surface-border bg-surface-card/50 p-2.5 overflow-y-auto overscroll-contain transition-[max-height] duration-200 ${expandedFilter === "franchises" ? "max-h-80" : "max-h-36"}`}
              >
                <FilterPill
                  label="All"
                  count={allPacks.length}
                  active={!activeFranchise}
                  onClick={() => handleSetFranchise(null)}
                  variant="franchise"
                />
                {allFranchises.map(([franchise, count]) => (
                  <FilterPill
                    key={franchise}
                    label={franchise}
                    count={count}
                    active={activeFranchise === franchise}
                    onClick={() =>
                      handleSetFranchise(
                        activeFranchise === franchise ? null : franchise,
                      )
                    }
                    variant="franchise"
                  />
                ))}
              </div>
              {(franchisesOverflow || expandedFilter === "franchises") && (
                <button
                  onClick={() =>
                    setExpandedFilter(
                      expandedFilter === "franchises" ? null : "franchises",
                    )
                  }
                  className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded border border-surface-border bg-surface-bg/90 font-mono text-[10px] text-text-dim hover:text-gold hover:border-gold/50 transition-colors"
                >
                  {expandedFilter === "franchises" ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tag pills */}
        {allTags.length > 0 && (
          <div
            className={
              expandedFilter === "tags"
                ? "md:col-span-2 md:order-first"
                : expandedFilter
                  ? "md:order-last"
                  : ""
            }
          >
            <span className="font-mono text-[11px] text-text-dim uppercase tracking-wide mb-1.5 block">
              Tags <span className="text-text-dim/50">({allTags.length})</span>
            </span>
            <div className="relative">
              <div
                ref={tagsRef}
                className={`flex flex-wrap gap-1.5 rounded-lg border border-surface-border bg-surface-card/50 p-2.5 overflow-y-auto overscroll-contain transition-[max-height] duration-200 ${expandedFilter === "tags" ? "max-h-80" : "max-h-36"}`}
              >
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
                    onClick={() => handleSetTag(activeTag === tag ? null : tag)}
                  />
                ))}
              </div>
              {(tagsOverflow || expandedFilter === "tags") && (
                <button
                  onClick={() =>
                    setExpandedFilter(expandedFilter === "tags" ? null : "tags")
                  }
                  className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded border border-surface-border bg-surface-bg/90 font-mono text-[10px] text-text-dim hover:text-gold hover:border-gold/50 transition-colors"
                >
                  {expandedFilter === "tags" ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Language pills */}
        {allLangs.length > 0 && (
          <div
            className={
              expandedFilter === "langs"
                ? "md:col-span-2 md:order-first"
                : expandedFilter
                  ? "md:order-last"
                  : ""
            }
          >
            <span className="font-mono text-[11px] text-text-dim uppercase tracking-wide mb-1.5 block">
              Languages{" "}
              <span className="text-text-dim/50">({allLangs.length})</span>
            </span>
            <div className="relative">
              <div
                ref={langsRef}
                className={`flex flex-wrap gap-1.5 rounded-lg border border-surface-border bg-surface-card/50 p-2.5 overflow-y-auto overscroll-contain transition-[max-height] duration-200 ${expandedFilter === "langs" ? "max-h-80" : "max-h-36"}`}
              >
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
                    label={LANGUAGE_LABELS[lang] ?? lang.toUpperCase()}
                    count={count}
                    active={activeLang === lang}
                    onClick={() =>
                      handleSetLang(activeLang === lang ? null : lang)
                    }
                    variant="lang"
                  />
                ))}
              </div>
              {(langsOverflow || expandedFilter === "langs") && (
                <button
                  onClick={() =>
                    setExpandedFilter(
                      expandedFilter === "langs" ? null : "langs",
                    )
                  }
                  className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded border border-surface-border bg-surface-bg/90 font-mono text-[10px] text-text-dim hover:text-gold hover:border-gold/50 transition-colors"
                >
                  {expandedFilter === "langs" ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
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

      <div
        ref={gridRef}
        className="scroll-mt-16 flex items-center justify-between text-xs text-text-dim mb-4"
      >
        <p>
          Showing {(safePage - 1) * PACKS_PER_PAGE + 1}–
          {Math.min(safePage * PACKS_PER_PAGE, filtered.length)} of{" "}
          {filtered.length} packs
        </p>
        <p>
          Updated{" "}
          {new Date().toLocaleDateString("en-US", {
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
            <p className="text-text-muted mb-3">
              No packs found matching your filters.
            </p>
            <a
              href="/requests"
              className="text-sm text-gold hover:underline transition-colors"
            >
              Request this pack &rarr;
            </a>
          </div>
        )}
      </ErrorBoundary>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          {/* Desktop: single row */}
          <div className="hidden sm:flex items-center justify-center gap-2">
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
          {/* Mobile: stacked */}
          <div className="flex sm:hidden flex-col items-center gap-2">
            <button
              onClick={() => handleSetPage(safePage - 1)}
              disabled={safePage <= 1}
              className="w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm text-text-muted hover:border-gold/50 hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-center"
            >
              &larr; Prev
            </button>
            <div className="flex flex-wrap justify-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handleSetPage(p)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-mono transition-colors ${
                    p === safePage
                      ? "border-gold text-gold bg-gold/10"
                      : "border-surface-border text-text-dim hover:border-gold/50 hover:text-text-muted"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleSetPage(safePage + 1)}
              disabled={safePage >= totalPages}
              className="w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm text-text-muted hover:border-gold/50 hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-center"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Filter pill component ────────────────────────────────────────────────────

const PILL_INACTIVE_STYLES = {
  default:
    "border-violet-700/50 text-violet-400/70 hover:border-violet-500/50 hover:text-violet-300",
  lang: "border-amber-700/50 text-amber-500/70 hover:border-gold/50 hover:text-gold",
  franchise:
    "border-emerald-700/50 text-emerald-400/70 hover:border-emerald-500/50 hover:text-emerald-300",
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
  variant?: "default" | "lang" | "franchise";
}) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-xs px-2.5 py-1 rounded-full border transition-colors ${
        active
          ? variant === "franchise"
            ? "border-emerald-500 text-emerald-300 bg-emerald-500/10"
            : variant === "default"
              ? "border-violet-500 text-violet-300 bg-violet-500/10"
              : "border-gold text-gold bg-gold/10"
          : PILL_INACTIVE_STYLES[variant]
      }`}
    >
      {label} <span className="opacity-50">{count}</span>
    </button>
  );
}
