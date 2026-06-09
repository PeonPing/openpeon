import type { PackMeta } from "@/lib/types";

// Tier styles mirror CategoryBadge's flat pill family. GOLD reuses the warm gold
// token; SILVER gets a distinct cool slate treatment so the two read as
// different tiers, not two identical neutral pills.
const TIER_STYLES: Partial<Record<NonNullable<PackMeta["quality"]>, string>> = {
  gold: "bg-gold/10 text-gold border-gold/20",
  silver: "bg-slate-400/10 text-slate-300 border-slate-400/20",
};

export function QualityBadge({
  quality,
  size = "sm",
}: {
  quality?: PackMeta["quality"];
  size?: "sm" | "xs";
}) {
  // Only gold and silver render. flagged packs are filtered out of the listing
  // upstream (registry.ts), and unreviewed or absent degrades to no badge — the
  // graceful pre-backfill state.
  const style = quality ? TIER_STYLES[quality] : undefined;
  if (!style) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono uppercase border ${
        size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      } ${style}`}
      title={`Quality tier: ${quality}`}
    >
      {quality}
    </span>
  );
}
