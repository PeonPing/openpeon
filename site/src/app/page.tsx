import Link from "next/link";
import { getAllPacks } from "@/lib/packs";
import { CESP_CATEGORIES } from "@/lib/categories";
import { PackCard } from "@/components/ui/PackCard";
import { CodeBlock } from "@/components/ui/CodeBlock";

const TIER_ORDER: Record<string, number> = { official: 0, verified: 1, community: 2 };

export default function HomePage() {
  const allPacks = getAllPacks();
  const featured = [...allPacks]
    .sort((a, b) => {
      const ta = TIER_ORDER[a.trustTier] ?? 9;
      const tb = TIER_ORDER[b.trustTier] ?? 9;
      if (ta !== tb) return ta - tb;
      return b.totalSoundCount - a.totalSoundCount;
    })
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Hero */}
      <section className="py-20 md:py-28 text-center relative">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,171,1,0.08)_0%,transparent_70%)] blur-3xl" />
        </div>
        <img src="/peon-logo.jpeg" alt="OpenPeon" className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto mb-6 shadow-lg shadow-gold/20" />
        <h1 className="font-display text-5xl md:text-6xl text-text-primary mb-4">
          OpenPeon
        </h1>
        <p className="text-lg md:text-xl text-text-muted max-w-xl mx-auto mb-8">
          An open standard for coding event sounds. Any IDE, any pack, one
          format.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/packs"
            className="rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-black hover:bg-gold/90 transition-colors"
          >
            Browse {allPacks.length} Packs
          </Link>
          <Link
            href="/spec"
            className="rounded-lg border border-surface-border px-6 py-2.5 text-sm text-text-muted hover:border-gold/50 hover:text-text-body transition-colors"
          >
            Read the Spec
          </Link>
        </div>
      </section>

      {/* What is CESP */}
      <section className="py-12">
        <h2 className="font-display text-2xl text-text-primary mb-3">
          What is CESP?
        </h2>
        <p className="text-text-body max-w-2xl mb-8">
          The Coding Event Sound Pack Specification defines a universal format
          for sound packs that respond to IDE events — task completions, errors,
          permission prompts, and more. Write a pack once, use it everywhere.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            {
              title: "Any IDE",
              desc: "Claude Code, Cursor, Codex, and more. One pack works across all tools that implement CESP.",
            },
            {
              title: `${allPacks.length}+ Sound Packs`,
              desc: "From Warcraft Peons to GLaDOS to StarCraft units. Gaming nostalgia meets developer productivity.",
            },
            {
              title: "Community Driven",
              desc: "Create your own pack with a single JSON manifest. Share it with the community via GitHub.",
            },
          ].map(({ title, desc }) => (
            <div
              key={title}
              className="rounded-lg border border-surface-border bg-surface-card p-5"
            >
              <h3 className="font-display text-lg text-text-primary mb-2">
                {title}
              </h3>
              <p className="text-sm text-text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Event Categories */}
      <section className="py-12">
        <h2 className="font-display text-2xl text-text-primary mb-6">
          Event Categories
        </h2>
        <div className="rounded-lg border border-surface-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-card">
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Description
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium hidden md:table-cell">
                  Tier
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(CESP_CATEGORIES).map(([key, info]) => (
                <tr
                  key={key}
                  className="border-b border-surface-border/50 last:border-0"
                >
                  <td className="px-4 py-3 font-mono text-gold text-xs">
                    {key}
                  </td>
                  <td className="px-4 py-3 text-text-body">
                    {info.description}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span
                      className={`text-xs rounded-full px-2 py-0.5 ${
                        info.tier === "core"
                          ? "bg-gold/10 text-gold"
                          : "bg-surface-border text-text-dim"
                      }`}
                    >
                      {info.tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Featured Packs */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-text-primary">
            Featured Packs
          </h2>
          <Link
            href="/packs"
            className="text-sm text-text-muted hover:text-gold transition-colors"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map(
            (pack) => pack && <PackCard key={pack.name} pack={pack} />
          )}
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-12">
        <h2 className="font-display text-2xl text-text-primary mb-6">
          Get Started
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-surface-border bg-surface-card p-6">
            <h3 className="font-display text-lg text-text-primary mb-2">
              Use Sound Packs
            </h3>
            <p className="text-sm text-text-muted mb-4">
              Install peon-ping to get sound feedback in Claude Code, Codex,
              Cursor, and 7 more tools.
            </p>
            <CodeBlock
              code="curl -fsSL https://raw.githubusercontent.com/PeonPing/peon-ping/main/install.sh | bash"
              language="bash"
            />
          </div>
          <div className="rounded-lg border border-surface-border bg-surface-card p-6">
            <h3 className="font-display text-lg text-text-primary mb-2">
              Add to Your CLI
            </h3>
            <p className="text-sm text-text-muted mb-4">
              Copy one block into your AI agent. It reads your codebase and
              wires up CESP support.
            </p>
            <Link
              href="/integrate"
              className="inline-flex rounded-lg border border-gold/30 px-4 py-2 text-sm text-gold hover:bg-gold/10 transition-colors"
            >
              Integration guide &rarr;
            </Link>
          </div>
          <div className="rounded-lg border border-surface-border bg-surface-card p-6">
            <h3 className="font-display text-lg text-text-primary mb-2">
              Create a Pack
            </h3>
            <p className="text-sm text-text-muted mb-4">
              Write an openpeon.json manifest, add your sounds, and share with
              the community.
            </p>
            <Link
              href="/create"
              className="inline-flex rounded-lg border border-gold/30 px-4 py-2 text-sm text-gold hover:bg-gold/10 transition-colors"
            >
              Pack creation guide &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Implementations */}
      <section className="py-12">
        <h2 className="font-display text-2xl text-text-primary mb-6">
          CESP Implementations
        </h2>
        <div className="rounded-lg border border-surface-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-card">
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Player
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  IDEs / Tools
                </th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-surface-border/50">
                <td className="px-4 py-3">
                  <a
                    href="https://github.com/PeonPing/peon-ping"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:underline"
                  >
                    peon-ping
                  </a>
                </td>
                <td className="px-4 py-3 text-text-body">
                  Claude Code, Codex, Cursor, Windsurf, Kiro, Copilot, Gemini CLI, OpenCode, Kilo Code, Google Antigravity
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs rounded-full bg-success/10 text-success px-2 py-0.5">
                    Active
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-text-dim italic">Your CLI</td>
                <td className="px-4 py-3 text-text-dim italic">Any tool</td>
                <td className="px-4 py-3">
                  <Link
                    href="/integrate"
                    className="text-xs text-text-muted hover:text-gold transition-colors"
                  >
                    Add CESP support &rarr;
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
