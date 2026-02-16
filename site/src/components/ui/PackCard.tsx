"use client";

import Link from "next/link";
import type { PackMeta } from "@/lib/types";
import { CategoryBadge } from "./CategoryBadge";
import { AudioPlayer } from "./AudioPlayer";

export function PackCard({ pack }: { pack: PackMeta }) {
  const preview = pack.previewSounds[0];

  return (
    <Link
      href={`/packs/${pack.name}`}
      className="group block rounded-lg border border-surface-border bg-surface-card p-4 transition-all duration-200 hover:border-gold/50 hover:bg-surface-card/80"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-display text-lg text-text-primary group-hover:text-gold transition-colors truncate">
          {pack.displayName}
        </h3>
        <span className="flex-shrink-0 rounded-full bg-surface-border px-2 py-0.5 text-[10px] font-mono text-text-muted uppercase">
          {pack.language}
        </span>
      </div>

      <div className="text-xs text-text-muted mb-3">
        <a
          href={pack.franchise.url}
          onClick={(e) => e.stopPropagation()}
          className="hover:text-text-muted transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          {pack.franchise.name}
        </a>
        <span className="mx-1.5 text-text-dim">·</span>
        <span>{pack.totalSoundCount} sounds</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {pack.categoryNames.slice(0, 4).map((cat) => (
          <CategoryBadge key={cat} name={cat} size="xs" />
        ))}
        {pack.categoryNames.length > 4 && (
          <span className="text-[10px] text-text-dim self-center">
            +{pack.categoryNames.length - 4}
          </span>
        )}
      </div>

      {preview && (
        <AudioPlayer
          url={preview.audioUrl}
          label={preview.label}
          id={`card-${pack.name}`}
          compact
        />
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
