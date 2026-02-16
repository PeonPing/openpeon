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

export function PackCard({ pack }: { pack: PackMeta }) {
  const preview = pack.previewSounds[0];

  return (
    <Link
      href={`/packs/${pack.name}`}
      className="group flex flex-col rounded-lg border border-surface-border bg-surface-card p-4 transition-all duration-200 hover:border-gold/50 hover:bg-surface-card/80"
    >
      {/* Name */}
      <h3 className="font-display text-lg text-text-primary group-hover:text-gold transition-colors truncate mb-1">
        {pack.displayName}
      </h3>

      {/* Description */}
      {pack.description && (
        <p className="text-xs text-text-muted mb-2 line-clamp-2">
          {pack.description}
        </p>
      )}

      {/* Tags */}
      {pack.tags && pack.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {pack.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-bg border border-surface-border text-text-dim"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Meta line */}
      <div className="font-mono text-[11px] text-text-dim mb-2">
        {pack.author.name || pack.author.github}
        <span className="mx-1 opacity-50">&middot;</span>
        {pack.totalSoundCount} sounds
        <span className="mx-1 opacity-50">&middot;</span>
        v{pack.version}
      </div>

      {/* Badges */}
      <div className="flex gap-1.5 mb-3">
        <TierBadge tier={pack.trustTier} />
        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full uppercase border border-amber-700/50 text-amber-500">
          {pack.languageLabel}
        </span>
      </div>

      {/* Audio preview */}
      {preview && (
        <div className="mt-auto">
          <AudioPlayer
            url={preview.audioUrl}
            label={preview.label}
            id={`card-${pack.name}`}
            compact
          />
        </div>
      )}

      {pack.sourceRepo && (
        <Link
          href={`/preview#${encodeURIComponent(pack.sourcePath ? pack.sourceRepo + "/" + pack.sourcePath : pack.sourceRepo)}`}
          onClick={(e) => e.stopPropagation()}
          className="block mt-2 text-[11px] font-medium text-gold hover:text-gold/80 transition-colors"
        >
          preview &rarr;
        </Link>
      )}
    </Link>
  );
}
