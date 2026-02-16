"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

interface PullRequest {
  number: number;
  title: string;
  html_url: string;
  created_at: string;
  user: { login: string; avatar_url: string };
  _source_repo?: string;
  _source_path?: string;
}

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

// ── Component ────────────────────────────────────────────────────────────────

export function TrackerClient() {
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const fetchPRs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "https://api.github.com/repos/PeonPing/registry/pulls?state=open&per_page=100"
      );
      if (!res.ok) {
        if (res.status === 403) {
          setError("GitHub API rate limit reached. Try again later.");
          setPrs([]);
          return;
        }
        throw new Error(`GitHub API error: ${res.status}`);
      }
      const data: PullRequest[] = await res.json();

      // Enrich PRs with source_repo from diff (for preview links)
      await Promise.all(
        data.map(async (pr) => {
          try {
            const filesRes = await fetch(
              `https://api.github.com/repos/PeonPing/registry/pulls/${pr.number}/files`
            );
            if (!filesRes.ok) return;
            const files: { filename: string; patch?: string }[] =
              await filesRes.json();
            const indexFile = files.find((f) => f.filename === "index.json");
            if (!indexFile?.patch) return;
            const repoMatch = indexFile.patch.match(
              /^\+.*"source_repo"\s*:\s*"([^"]+)"/m
            );
            const pathMatch = indexFile.patch.match(
              /^\+.*"source_path"\s*:\s*"([^"]+)"/m
            );
            if (repoMatch) {
              pr._source_repo = repoMatch[1];
              pr._source_path = pathMatch ? pathMatch[1] : undefined;
            }
          } catch {
            // Ignore enrichment failures
          }
        })
      );

      setPrs(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch PRs");
      setPrs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPRs();
  }, [fetchPRs]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="font-display text-3xl text-text-primary">
          Registry Tracker
        </h1>
        <button
          onClick={fetchPRs}
          disabled={loading}
          className="flex-shrink-0 rounded-lg border border-surface-border bg-surface-card px-4 py-2 text-sm text-text-muted hover:border-gold/50 hover:text-gold transition-colors disabled:opacity-50 disabled:cursor-wait"
        >
          Refresh
        </button>
      </div>
      <p className="text-text-muted mb-2">
        Pending pack submissions to the OpenPeon registry.
      </p>
      {lastUpdated && (
        <p className="font-mono text-xs text-text-dim mb-8">
          Last refreshed: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {/* Status */}
      {loading ? (
        <div className="rounded-lg border border-surface-border bg-surface-card p-12 text-center">
          <p className="text-text-muted">
            Fetching open pull requests from GitHub...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-surface-border bg-surface-card p-12 text-center">
          <p className="text-text-dim">{error}</p>
        </div>
      ) : prs.length === 0 ? (
        <div className="rounded-lg border border-surface-border bg-surface-card p-12 text-center">
          <p className="text-text-dim">
            No pending submissions right now. The queue is clear.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-text-dim mb-4">
            {prs.length} open pull request{prs.length !== 1 ? "s" : ""}
          </p>
          <div className="flex flex-col gap-3">
            {prs.map((pr) => (
              <PRCard key={pr.number} pr={pr} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function PRCard({ pr }: { pr: PullRequest }) {
  const ago = timeAgo(new Date(pr.created_at));

  return (
    <div className="rounded-lg border border-surface-border bg-surface-card transition-all duration-200 hover:border-gold/50">
      <div className="flex items-center gap-3 p-4">
        {/* PR icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-success"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z" />
          </svg>
        </div>

        {/* PR info */}
        <div className="flex-1 min-w-0">
          <a
            href={pr.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-text-primary hover:text-gold transition-colors truncate block"
          >
            {pr.title}
          </a>
          <div className="font-mono text-xs text-text-dim mt-0.5">
            #{pr.number} opened {ago} by{" "}
            <span className="text-text-muted">{pr.user.login}</span>
          </div>
        </div>

        {/* Source repo badge */}
        {pr._source_repo && (
          <span className="hidden sm:inline-flex flex-shrink-0 font-mono text-[11px] text-text-dim border border-surface-border rounded-md px-2 py-1">
            {pr._source_repo}
          </span>
        )}

        {/* Open badge */}
        <span className="flex-shrink-0 text-xs font-medium text-success bg-success/10 border border-success/20 rounded-full px-2.5 py-0.5">
          Open
        </span>
      </div>
    </div>
  );
}
