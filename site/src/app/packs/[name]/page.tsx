import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllPacks, getPack, getPackNames } from "@/lib/packs";
import { CESP_CATEGORIES } from "@/lib/categories";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { PackSounds } from "./PackSounds";

export function generateStaticParams() {
  return getPackNames().map((name) => ({ name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const pack = getPack(name);
  if (!pack) return { title: "Pack Not Found" };
  return {
    title: `${pack.displayName}`,
    description: `${pack.displayName} — ${pack.totalSoundCount} sounds across ${pack.categoryNames.length} categories. ${pack.franchise.name} sound pack for CESP.`,
  };
}

export default async function PackDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const pack = getPack(name);
  if (!pack) notFound();

  const allPacks = getAllPacks();
  const idx = allPacks.findIndex((p) => p.name === name);
  const prev = idx > 0 ? allPacks[idx - 1] : null;
  const next = idx < allPacks.length - 1 ? allPacks[idx + 1] : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Breadcrumb */}
      <Link
        href="/packs"
        className="text-sm text-text-dim hover:text-text-muted transition-colors mb-6 inline-block"
      >
        &larr; All packs
      </Link>

      {/* Hero */}
      <div className="mb-6">
        <h1 className="font-display text-3xl text-text-primary mb-2">
          {pack.displayName}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <a
            href={pack.franchise.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-gold transition-colors"
          >
            {pack.franchise.name}
          </a>
          <span className="text-text-dim">·</span>
          <span className="text-text-dim">
            Added by{" "}
            <a
              href={`https://github.com/${pack.author.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-dim hover:text-text-muted transition-colors"
            >
              @{pack.author.github}
            </a>
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="rounded-full bg-surface-card border border-surface-border px-3 py-1 text-xs text-text-muted font-mono">
          v{pack.version}
        </span>
        <span className="rounded-full bg-surface-card border border-surface-border px-3 py-1 text-xs text-text-muted">
          {pack.languageLabel}
        </span>
        <span className="rounded-full bg-surface-card border border-surface-border px-3 py-1 text-xs text-text-muted font-mono">
          {pack.license}
        </span>
        <span className="rounded-full bg-surface-card border border-surface-border px-3 py-1 text-xs text-text-muted">
          {pack.totalSoundCount} sounds
        </span>
        <span className="rounded-full bg-surface-card border border-surface-border px-3 py-1 text-xs text-text-muted">
          {pack.categoryNames.length} categories
        </span>
      </div>

      {/* Category Sections */}
      <div className="space-y-8 mb-12">
        {pack.categories.map((cat) => {
          const info = CESP_CATEGORIES[cat.name];
          return (
            <section key={cat.name}>
              <div className="flex items-center gap-2 mb-3">
                <CategoryBadge name={cat.name} />
                {info && (
                  <span className="text-xs text-text-dim">
                    {info.description}
                  </span>
                )}
              </div>
              <PackSounds sounds={cat.sounds} packName={pack.name} categoryName={cat.name} />
            </section>
          );
        })}
      </div>

      {/* Install */}
      <section className="mb-12">
        <h2 className="font-display text-xl text-text-primary mb-4">
          Use this pack
        </h2>
        <CodeBlock
          code={`peon packs use ${pack.name}`}
          language="bash"
        />
        <p className="text-xs text-text-dim mt-2">
          Requires{" "}
          <a
            href="https://github.com/PeonPing/peon-ping"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-gold transition-colors"
          >
            peon-ping
          </a>{" "}
          installed.
        </p>
      </section>

      {/* Nav */}
      <div className="flex items-center justify-between border-t border-surface-border pt-6">
        {prev ? (
          <Link
            href={`/packs/${prev.name}`}
            className="text-sm text-text-muted hover:text-gold transition-colors"
          >
            &larr; {prev.displayName}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/packs/${next.name}`}
            className="text-sm text-text-muted hover:text-gold transition-colors"
          >
            {next.displayName} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
