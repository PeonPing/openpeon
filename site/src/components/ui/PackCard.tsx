"use client";

import Link from "next/link";
import type { PackMeta } from "@/lib/types";
import { AudioPlayer } from "./AudioPlayer";

const TIER_STYLES: Record<string, string> = {
  official: "bg-success/10 text-success border-success/20",
  verified: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  community: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

function TierBadge({ tier }: { tier: string }) {
  const style = TIER_STYLES[tier] || TIER_STYLES.community;
  return (
    <span
      className={`font-mono text-[10px] px-2 py-0.5 rounded-full uppercase border ${style}`}
    >
      {tier}
    </span>
  );
}

function formatDate(iso: string): { short: string; tooltip: string } {
  const date = new Date(iso);
  const now = new Date();
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  const short = year === now.getFullYear() ? `${month} ${day}` : `${month} ${day}, ${year}`;
  return { short, tooltip: `${month} ${day}, ${year}` };
}

function DateDisplay({ pack }: { pack: PackMeta }) {
  const raw = pack.dateUpdated || pack.dateAdded;
  if (!raw) return null;
  const isUpdated = !!pack.dateUpdated;
  const { short, tooltip } = formatDate(raw);
  return (
    <span title={`${isUpdated ? "Updated" : "Added"} ${tooltip}`}>
      {short}
    </span>
  );
}

export function PackCard({ pack }: { pack: PackMeta }) {
  const preview = pack.previewSounds[0];

  return (
    <Link
      href={`/packs/${pack.name}`}
      className="group flex flex-col rounded-lg border border-surface-border bg-surface-card transition-all duration-200 hover:border-gold/50 hover:bg-surface-card/80"
    >
      {/* ── Title Bar ── */}
      <div className="px-4 pt-2 pb-2 border-b border-surface-border">
        <h3 className="font-display text-lg text-text-primary group-hover:text-gold transition-colors truncate" title={pack.displayName}>
          {pack.displayName}
        </h3>
      </div>

      {/* ── Content Zone ── */}
      <div className="flex-1 px-4 py-3 flex flex-col gap-2">
        {/* Description — fixed height to keep alignment across cards */}
        <p className="text-xs text-text-muted line-clamp-2 min-h-[2.5rem]">
          {pack.description || "\u00A0"}
        </p>

        {/* Badges */}
        <div className="flex gap-1.5">
          <TierBadge tier={pack.trustTier} />
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full uppercase border border-amber-700/50 text-amber-500">
            {pack.languageLabel}
          </span>
        </div>

        {/* Tags — single line, overflow hidden */}
        {pack.tags && pack.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 overflow-hidden max-h-[1.5rem]">
            {pack.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-bg border border-surface-border text-text-subtle"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Author */}
        {(pack.author.name || pack.author.github) && (
          <p className="font-mono text-[11px] text-text-dim">
            {pack.author.name || pack.author.github}
          </p>
        )}
      </div>

      {/* ── Status Bar ── */}
      <div className="px-4 py-2 border-t border-surface-border flex items-center justify-between">
        {/* Play button */}
        {preview ? (
          <AudioPlayer
            url={preview.audioUrl}
            label={preview.label}
            id={`card-${pack.name}`}
            iconOnly
          />
        ) : (
          <div className="w-7 h-7" />
        )}

        {/* Stats */}
        <div className="font-mono text-xs text-text-dim flex items-center gap-1.5">
          <span title={`${pack.totalSoundCount} sounds`}>
            ♫ {pack.totalSoundCount}
          </span>
          <span className="opacity-40">&middot;</span>
          <span>v{pack.version}</span>
          {(pack.dateUpdated || pack.dateAdded) && (
            <>
              <span className="opacity-40">&middot;</span>
              <DateDisplay pack={pack} />
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
