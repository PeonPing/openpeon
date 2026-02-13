"use client";

import { useState, useMemo } from "react";
import { getAllPacks, getLanguageLabels } from "@/lib/packs";
import { PackCard } from "@/components/ui/PackCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function PacksPage() {
  const allPacks = getAllPacks();
  const languages = getLanguageLabels();
  const [query, setQuery] = useState("");
  const [langFilter, setLangFilter] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return allPacks.filter((pack) => {
      const matchesSearch =
        !q ||
        pack.displayName.toLowerCase().includes(q) ||
        pack.name.includes(q) ||
        pack.author.name.toLowerCase().includes(q) ||
        pack.franchise.name.toLowerCase().includes(q);
      const matchesLang = !langFilter || pack.language === langFilter;
      return matchesSearch && matchesLang;
    });
  }, [allPacks, query, langFilter]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-3xl text-text-primary mb-2">
        Sound Packs
      </h1>
      <p className="text-text-muted mb-8">
        {allPacks.length} CESP-compatible sound packs for your IDE.
      </p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by name, author, franchise..."
          />
        </div>
        <select
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value)}
          className="rounded-lg border border-surface-border bg-surface-card px-3 py-2.5 text-sm text-text-body focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
        >
          <option value="">All languages</option>
          {languages.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
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
              No packs found matching your search.
            </p>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}
