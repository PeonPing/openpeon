import { CESP_CATEGORIES } from "@/lib/categories";

export function CategoryBadge({
  name,
  size = "sm",
}: {
  name: string;
  size?: "sm" | "xs";
}) {
  const info = CESP_CATEGORIES[name];
  const isCore = info?.tier === "core";

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono ${
        size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      } ${
        isCore
          ? "bg-gold/10 text-gold border border-gold/20"
          : "bg-surface-border/50 text-text-dim border border-surface-border"
      }`}
      title={info?.description}
    >
      {name}
    </span>
  );
}
