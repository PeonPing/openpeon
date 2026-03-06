"use client";

import Link from "next/link";
import type { PackMeta } from "@/lib/types";
import { AudioPlayer } from "./AudioPlayer";
import { StarIcon, VerifiedIcon, CommunityIcon } from "@/components/icons";

const TIER_INFO: Record<string, { color: string; label: string }> = {
  official: { color: "text-success", label: "PeonPing" },
  verified: { color: "text-blue-400", label: "PeonPing Verified" },
  community: { color: "text-purple-400", label: "Community" },
};

const TIER_ICON_COMPONENTS: Record<
  string,
  ({ className }: { className?: string }) => React.JSX.Element
> = {
  official: StarIcon,
  verified: VerifiedIcon,
  community: CommunityIcon,
};

function TierLabel({ tier }: { tier: string }) {
  const { color, label } = TIER_INFO[tier] || TIER_INFO.community;
  const Icon = TIER_ICON_COMPONENTS[tier] || TIER_ICON_COMPONENTS.community;
  return (
    <span
      className={`${color} font-mono text-[10px] shrink-0 flex items-center gap-1`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

function formatDate(iso: string): { short: string; tooltip: string } {
  const date = new Date(iso);
  const now = new Date();
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  const short =
    year === now.getFullYear() ? `${month} ${day}` : `${month} ${day}, ${year}`;
  return { short, tooltip: `${month} ${day}, ${year}` };
}

function DateDisplay({ pack }: { pack: PackMeta }) {
  const raw = pack.dateUpdated || pack.dateAdded;
  if (!raw) return null;
  const isUpdated = !!pack.dateUpdated;
  const { short, tooltip } = formatDate(raw);
  return (
    <span title={`${isUpdated ? "Updated" : "Added"} ${tooltip}`}>{short}</span>
  );
}

const TITLE_SIZES = ["text-lg", "text-base", "text-sm"];
const TITLE_BASE =
  "font-display text-text-primary group-hover:text-gold transition-colors whitespace-nowrap overflow-hidden text-ellipsis";

function fitTitleRef(el: HTMLHeadingElement | null) {
  if (!el) return;
  // Reset to largest, then step down until it fits
  el.className = `${TITLE_BASE} ${TITLE_SIZES[0]}`;
  let idx = 0;
  while (el.scrollWidth > el.clientWidth && idx < TITLE_SIZES.length - 1) {
    idx++;
    el.className = `${TITLE_BASE} ${TITLE_SIZES[idx]}`;
  }
}

export function PackCard({ pack }: { pack: PackMeta }) {
  const preview = pack.previewSounds[0];

  return (
    <Link
      href={`/packs/${pack.name}`}
      className="group flex flex-col min-w-0 rounded-lg border border-surface-border bg-surface-card transition-all duration-200 hover:border-gold/50 hover:bg-surface-card/80"
    >
      {/* ── Title Bar ── */}
      <div className="px-4 pt-2 pb-2 border-b border-surface-border">
        <h3
          ref={fitTitleRef}
          className={`${TITLE_BASE} ${TITLE_SIZES[0]}`}
          title={pack.displayName}
        >
          {pack.displayName}
        </h3>
      </div>

      {/* ── Content Zone ── */}
      <div className="flex-1 px-4 py-3 flex flex-col gap-2">
        {/* Description */}
        {pack.description && (
          <p className="text-xs text-text-muted line-clamp-2">
            {pack.description}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {pack.franchise.name && pack.franchise.name !== "Unknown" && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full uppercase border border-emerald-700/50 text-emerald-400">
              {pack.franchise.name}
            </span>
          )}
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
      </div>

      {/* ── Author + Tier Row ── */}
      <div className="px-4 py-1.5 border-t border-surface-border flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-text-dim truncate">
          {pack.author.name || pack.author.github || "\u00A0"}
        </span>
        <TierLabel tier={pack.trustTier} />
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
