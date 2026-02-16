"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchInput } from "@/components/ui/SearchInput";

// ── Types ────────────────────────────────────────────────────────────────────

interface PackRequest {
  number: number;
  title: string;
  body: string;
  html_url: string;
  created_at: string;
  state: string;
  user: { login: string; avatar_url: string };
  reactions: {
    "+1": number;
    "-1": number;
    laugh: number;
    hooray: number;
    confused: number;
    heart: number;
    rocket: number;
    eyes: number;
    total_count: number;
  };
  labels: { name: string; color: string }[];
}

interface CachedData {
  requests: PackRequest[];
  timestamp: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const CACHE_KEY = "openpeon-requests-cache";
const CACHE_TTL_MS = 5 * 60 * 1000;
const REPO_OWNER = "PeonPing";
const REPO_NAME = "registry";
const LABEL = "pack-request";

const NEW_ISSUE_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new?template=pack-request.yml&labels=${LABEL}&title=%5BRequest%5D+`;

type SortKey = "upvotes" | "newest" | "oldest";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "upvotes", label: "Most upvoted" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

function readCache(): CachedData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedData = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) return null;
    return cached;
  } catch {
    return null;
  }
}

function readCacheStale(): CachedData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(requests: PackRequest[]) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ requests, timestamp: Date.now() })
    );
  } catch {
    // Storage full or unavailable
  }
}

function sortRequests(requests: PackRequest[], key: SortKey): PackRequest[] {
  const sorted = [...requests];
  switch (key) {
    case "upvotes":
      return sorted.sort((a, b) => b.reactions["+1"] - a.reactions["+1"]);
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    default:
      return sorted;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export function RequestsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [requests, setRequests] = useState<PackRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [sortKey, setSortKey] = useState<SortKey>(
    (searchParams.get("sort") as SortKey) || "upvotes"
  );

  // URL sync
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
      if (params.get("sort") === "upvotes") params.delete("sort");
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "/requests", { scroll: false });
    },
    [searchParams, router]
  );

  const handleSetQuery = useCallback(
    (q: string) => {
      setQuery(q);
      updateUrl({ q: q || null });
    },
    [updateUrl]
  );

  const handleSetSort = useCallback(
    (sort: SortKey) => {
      setSortKey(sort);
      updateUrl({ sort: sort === "upvotes" ? null : sort });
    },
    [updateUrl]
  );

  // Fetch
  const fetchRequests = useCallback(async (skipCache = false) => {
    if (!skipCache) {
      const cached = readCache();
      if (cached) {
        setRequests(cached.requests);
        setLastUpdated(new Date(cached.timestamp));
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?labels=${LABEL}&state=all&per_page=100&sort=created&direction=desc`,
        { headers: { Accept: "application/vnd.github+json" } }
      );
      if (!res.ok) {
        if (res.status === 403) {
          const stale = readCacheStale();
          if (stale) {
            setRequests(stale.requests);
            setLastUpdated(new Date(stale.timestamp));
            setError("Rate limit reached. Showing cached data.");
          } else {
            const resetHeader = res.headers.get("X-RateLimit-Reset");
            const resetTime = resetHeader
              ? new Date(parseInt(resetHeader) * 1000).toLocaleTimeString()
              : "later";
            setError(
              `GitHub API rate limit reached. Try again at ${resetTime}.`
            );
            setRequests([]);
          }
          return;
        }
        throw new Error(`GitHub API error: ${res.status}`);
      }
      const data: PackRequest[] = await res.json();
      setRequests(data);
      setLastUpdated(new Date());
      writeCache(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch requests"
      );
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Filter + sort
  const filtered = useMemo(() => {
    let items = requests;
    if (query) {
      const q = query.toLowerCase();
      items = items.filter((r) =>
        [r.title, r.body, r.user.login]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    return sortRequests(items, sortKey);
  }, [requests, query, sortKey]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="font-display text-3xl text-text-primary">
          Pack Requests
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => fetchRequests(true)}
            disabled={loading}
            className="flex-shrink-0 rounded-lg border border-surface-border bg-surface-card px-4 py-2 text-sm text-text-muted hover:border-gold/50 hover:text-gold transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            Refresh
          </button>
          <a
            href={NEW_ISSUE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 rounded-lg border border-gold bg-gold/10 px-4 py-2 text-sm text-gold hover:bg-gold/20 transition-colors"
          >
            Request a Pack
          </a>
        </div>
      </div>
      <p className="text-text-muted mb-2">
        Vote on community pack requests or suggest your own.
      </p>
      {lastUpdated && (
        <p className="font-mono text-xs text-text-dim mb-6">
          Last refreshed: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {/* Search + Sort */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <SearchInput
            value={query}
            onChange={handleSetQuery}
            placeholder="Search requests..."
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

      {/* Content */}
      {loading ? (
        <div className="rounded-lg border border-surface-border bg-surface-card p-12 text-center">
          <p className="text-text-muted">
            Fetching pack requests from GitHub...
          </p>
        </div>
      ) : error && requests.length === 0 ? (
        <div className="rounded-lg border border-surface-border bg-surface-card p-12 text-center">
          <p className="text-text-dim">{error}</p>
        </div>
      ) : filtered.length === 0 && !query ? (
        <div className="rounded-lg border border-surface-border bg-surface-card p-12 text-center">
          <p className="text-text-dim mb-4">
            No pack requests yet. Be the first!
          </p>
          <a
            href={NEW_ISSUE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-lg border border-gold bg-gold/10 px-4 py-2 text-sm text-gold hover:bg-gold/20 transition-colors"
          >
            Request a Pack
          </a>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-surface-border bg-surface-card p-12 text-center">
          <p className="text-text-muted">
            No requests found matching your search.
          </p>
        </div>
      ) : (
        <>
          {error && (
            <div className="rounded-lg border border-amber-700/50 bg-amber-900/20 px-4 py-2 mb-4">
              <p className="text-xs text-amber-400">{error}</p>
            </div>
          )}
          <p className="text-xs text-text-dim mb-4">
            {filtered.length} request{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="flex flex-col gap-3">
            {filtered.map((req) => (
              <RequestCard key={req.number} request={req} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function RequestCard({ request }: { request: PackRequest }) {
  const ago = timeAgo(new Date(request.created_at));
  const isClosed = request.state === "closed";
  const description = request.body
    ? request.body
        .replace(/### .+/g, "")
        .replace(/\n{2,}/g, " ")
        .trim()
        .slice(0, 200) + (request.body.length > 200 ? "..." : "")
    : "";

  return (
    <div
      className={`rounded-lg border border-surface-border bg-surface-card transition-all duration-200 hover:border-gold/50 ${
        isClosed ? "opacity-60" : ""
      }`}
    >
      <div className="flex gap-4 p-4">
        {/* Upvote section */}
        <a
          href={request.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 flex-shrink-0 group"
          title="Vote on GitHub"
        >
          <svg
            className="w-5 h-5 text-text-dim group-hover:text-gold transition-colors"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 10v12" />
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
          </svg>
          <span className="font-mono text-sm text-text-muted group-hover:text-gold transition-colors">
            {request.reactions["+1"]}
          </span>
        </a>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <a
            href={request.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-text-primary hover:text-gold transition-colors block"
          >
            {request.title.replace(/^\[Request\]\s*/i, "")}
          </a>
          {description && (
            <p className="text-xs text-text-dim mt-1 line-clamp-2">
              {description}
            </p>
          )}
          <div className="font-mono text-xs text-text-dim mt-2">
            #{request.number} opened {ago} by{" "}
            <span className="text-text-muted">{request.user.login}</span>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`flex-shrink-0 self-start text-xs font-medium rounded-full px-2.5 py-0.5 ${
            isClosed
              ? "text-text-dim bg-surface-border/50 border border-surface-border"
              : "text-success bg-success/10 border border-success/20"
          }`}
        >
          {isClosed ? "Closed" : "Open"}
        </span>
      </div>
    </div>
  );
}
