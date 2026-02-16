import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllPacks, getPack, getPackNames } from "@/lib/packs";
import { CESP_CATEGORIES } from "@/lib/categories";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { PackSounds } from "./PackSounds";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { PackCard } from "@/components/ui/PackCard";

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: pack.displayName,
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any",
            description: `${pack.displayName} — ${pack.totalSoundCount} sounds across ${pack.categoryNames.length} categories. ${pack.franchise.name} sound pack for CESP.`,
            author: {
              "@type": "Person",
              name: pack.author.name || pack.author.github,
            },
            softwareVersion: pack.version,
            license: pack.license,
          }),
        }}
      />
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

      {/* Source */}
      {pack.sourceRepo && (
        <div className="mb-8">
          <a
            href={`https://github.com/${pack.sourceRepo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-text-dim hover:text-gold transition-colors font-mono"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            {pack.sourceRepo}{pack.sourcePath ? `/${pack.sourcePath}` : ""}
          </a>
        </div>
      )}

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
              <ErrorBoundary>
                <PackSounds sounds={cat.sounds} packName={pack.name} categoryName={cat.name} />
              </ErrorBoundary>
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

      {/* Related Packs */}
      {(() => {
        const related = allPacks
          .filter((p) => p.name !== pack.name)
          .map((p) => {
            let score = 0;
            if (p.franchise.name === pack.franchise.name) score += 3;
            if (p.language === pack.language) score += 1;
            const sharedTags = (p.tags || []).filter((t) => (pack.tags || []).includes(t));
            score += sharedTags.length;
            return { pack: p, score };
          })
          .filter((r) => r.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((r) => r.pack);

        if (related.length === 0) return null;

        return (
          <section className="mb-12">
            <h2 className="font-display text-xl text-text-primary mb-4">
              Related Packs
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((rp) => (
                <PackCard key={rp.name} pack={rp} />
              ))}
            </div>
          </section>
        );
      })()}

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
