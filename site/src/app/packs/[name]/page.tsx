import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchAllPacks } from "@/lib/registry";
import { CESP_CATEGORIES } from "@/lib/categories";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { PackSounds } from "./PackSounds";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { PackCard } from "@/components/ui/PackCard";

export const dynamicParams = true;
export const revalidate = 1800;

export async function generateStaticParams() {
  const packs = await fetchAllPacks();
  return packs.map((p) => ({ name: p.name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const packs = await fetchAllPacks();
  const pack = packs.find((p) => p.name === name);
  if (!pack) return { title: "Pack Not Found" };
  return {
    title: `${pack.displayName}`,
    description: `${pack.displayName} — ${pack.totalSoundCount} sounds across ${pack.categoryNames.length} categories.${pack.franchise.name !== "Unknown" ? ` ${pack.franchise.name} sound pack for PeonPing and other CESP-compatible players.` : " Sound pack for CESP."}`,
  };
}

export default async function PackDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const allPacks = await fetchAllPacks();
  const idx = allPacks.findIndex((p) => p.name === name);
  const pack = allPacks[idx];
  if (!pack) notFound();
  const prev = idx > 0 ? allPacks[idx - 1] : null;
  const next = idx < allPacks.length - 1 ? allPacks[idx + 1] : null;

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: pack.displayName,
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any",
            description: `${pack.displayName} — ${pack.totalSoundCount} sounds across ${pack.categoryNames.length} categories.${pack.franchise.name !== "Unknown" ? ` ${pack.franchise.name} sound pack for PeonPing and other CESP-compatible players.` : " Sound pack for CESP."}`,
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
          {pack.franchise.name !== "Unknown" && (
            <>
              {pack.franchise.url ? (
                <a
                  href={pack.franchise.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-gold transition-colors"
                >
                  {pack.franchise.name}
                </a>
              ) : (
                <span className="text-text-muted">{pack.franchise.name}</span>
              )}
              <span className="text-text-dim">·</span>
            </>
          )}
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
            <GitHubIcon className="w-3.5 h-3.5" />
            {pack.sourceRepo}
            {pack.sourcePath ? `/${pack.sourcePath}` : ""}
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
                <PackSounds
                  sounds={cat.sounds}
                  packName={pack.name}
                  categoryName={cat.name}
                />
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
        <CodeBlock code={`peon packs use ${pack.name}`} language="bash" />
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
            const sharedTags = (p.tags || []).filter((t) =>
              (pack.tags || []).includes(t),
            );
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
