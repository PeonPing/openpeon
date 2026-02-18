import type { Metadata } from "next";
import { CESP_CATEGORIES } from "@/lib/categories";
import { CodeBlock } from "@/components/ui/CodeBlock";

export const metadata: Metadata = {
  title: "CESP v1.0 Specification",
  description:
    "The Coding Event Sound Pack Specification (CESP) v1.0 — defines a universal format for sound packs that respond to IDE events.",
};

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "categories", label: "Event Categories" },
  { id: "manifest", label: "Manifest Format" },
  { id: "directory", label: "Directory Structure" },
  { id: "audio", label: "Audio Constraints" },
  { id: "ide-mapping", label: "IDE Mapping" },
  { id: "player", label: "Player Behavior" },
];

const MANIFEST_EXAMPLE = `{
  "cesp_version": "1.0",
  "name": "my-pack",
  "display_name": "My Sound Pack",
  "version": "1.0.0",
  "description": "A custom sound pack for my IDE",
  "author": {
    "name": "yourname",
    "github": "yourname"
  },
  "license": "CC-BY-NC-4.0",
  "language": "en",
  "categories": {
    "session.start": {
      "sounds": [
        {
          "file": "sounds/hello.mp3",
          "label": "Hello!",
          "sha256": "abc123..."
        }
      ]
    },
    "task.complete": {
      "sounds": [
        {
          "file": "sounds/done.mp3",
          "label": "Done!",
          "sha256": "def456..."
        }
      ]
    }
  }
}`;

const DIRECTORY_EXAMPLE = `my-pack/
  openpeon.json        # Required manifest
  sounds/              # Audio files
    hello.mp3
    done.mp3
    error.mp3
  README.md            # Optional
  LICENSE              # Optional`;

export default function SpecPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="lg:flex lg:gap-12">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block lg:w-48 flex-shrink-0">
          <nav className="sticky top-20 space-y-1">
            <p className="text-xs font-medium text-text-dim uppercase tracking-wider mb-3">
              On this page
            </p>
            {TOC.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="block text-sm text-text-muted hover:text-gold transition-colors py-1"
              >
                {label}
              </a>
            ))}
            <div className="border-t border-surface-border mt-4 pt-4">
              <a
                href="https://github.com/PeonPing/openpeon/blob/main/spec/cesp-v1.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-text-dim hover:text-text-muted transition-colors"
              >
                View on GitHub &rarr;
              </a>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl text-text-primary mb-2">
            CESP v1.0
          </h1>
          <p className="text-text-muted mb-8">
            Coding Event Sound Pack Specification
          </p>

          {/* Overview */}
          <section id="overview" className="mb-12 scroll-mt-20">
            <h2 className="font-display text-xl text-text-primary mb-4">
              Overview
            </h2>
            <p className="text-text-body mb-4">
              CESP defines a universal format for sound packs that respond to
              coding events in agentic IDEs. A single pack works across Claude
              Code, Cursor, Codex, and any tool that implements the
              specification.
            </p>
            <p className="text-text-body mb-4">
              The spec covers three things: a set of{" "}
              <strong className="text-text-primary">event categories</strong>{" "}
              that IDEs emit, a{" "}
              <strong className="text-text-primary">manifest format</strong>{" "}
              (openpeon.json) that maps categories to audio files, and{" "}
              <strong className="text-text-primary">player behavior</strong>{" "}
              requirements for how sounds should be played.
            </p>
            <p className="text-sm text-text-dim">
              Key words: MUST, SHOULD, and MAY are used per{" "}
              <a
                href="https://datatracker.ietf.org/doc/html/rfc2119"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-gold"
              >
                RFC 2119
              </a>
              .
            </p>
          </section>

          {/* Event Categories */}
          <section id="categories" className="mb-12 scroll-mt-20">
            <h2 className="font-display text-xl text-text-primary mb-4">
              Event Categories
            </h2>
            <p className="text-text-body mb-4">
              CESP defines 9 event categories. Players <strong className="text-text-primary">MUST</strong> support the 6 core categories. Extended categories are optional.
            </p>

            <h3 className="text-sm font-medium text-text-primary mt-6 mb-3">
              Core Categories
            </h3>
            <div className="rounded-lg border border-surface-border overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-card">
                    <th className="text-left px-4 py-2.5 text-text-muted font-medium">Category</th>
                    <th className="text-left px-4 py-2.5 text-text-muted font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(CESP_CATEGORIES)
                    .filter(([, v]) => v.tier === "core")
                    .map(([key, info]) => (
                      <tr key={key} className="border-b border-surface-border/50 last:border-0">
                        <td className="px-4 py-2.5 font-mono text-gold text-xs">{key}</td>
                        <td className="px-4 py-2.5 text-text-body">{info.description}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-sm font-medium text-text-primary mt-6 mb-3">
              Extended Categories
            </h3>
            <div className="rounded-lg border border-surface-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-card">
                    <th className="text-left px-4 py-2.5 text-text-muted font-medium">Category</th>
                    <th className="text-left px-4 py-2.5 text-text-muted font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(CESP_CATEGORIES)
                    .filter(([, v]) => v.tier === "extended")
                    .map(([key, info]) => (
                      <tr key={key} className="border-b border-surface-border/50 last:border-0">
                        <td className="px-4 py-2.5 font-mono text-text-dim text-xs">{key}</td>
                        <td className="px-4 py-2.5 text-text-muted">{info.description}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Manifest */}
          <section id="manifest" className="mb-12 scroll-mt-20">
            <h2 className="font-display text-xl text-text-primary mb-4">
              Manifest Format
            </h2>
            <p className="text-text-body mb-4">
              Every pack <strong className="text-text-primary">MUST</strong>{" "}
              include an <code className="text-gold font-mono text-sm">openpeon.json</code> file at its root.
            </p>

            <h3 className="text-sm font-medium text-text-primary mt-6 mb-3">
              Required Fields
            </h3>
            <div className="rounded-lg border border-surface-border overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-card">
                    <th className="text-left px-4 py-2.5 text-text-muted font-medium">Field</th>
                    <th className="text-left px-4 py-2.5 text-text-muted font-medium">Type</th>
                    <th className="text-left px-4 py-2.5 text-text-muted font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["cesp_version", "string", '"1.0"'],
                    ["name", "string", "Machine-readable ID (a-z0-9, hyphens, underscores)"],
                    ["display_name", "string", "Human-readable name (1-128 chars)"],
                    ["version", "string", "Semantic version (e.g. 1.0.0)"],
                    ["categories", "object", "Map of category names to sound arrays"],
                  ].map(([field, type, desc]) => (
                    <tr key={field} className="border-b border-surface-border/50 last:border-0">
                      <td className="px-4 py-2.5 font-mono text-gold text-xs">{field}</td>
                      <td className="px-4 py-2.5 font-mono text-text-dim text-xs">{type}</td>
                      <td className="px-4 py-2.5 text-text-body">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-sm font-medium text-text-primary mt-6 mb-3">
              Recommended Fields
            </h3>
            <div className="rounded-lg border border-surface-border overflow-hidden mb-6">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ["author", "object", "{ name, github } — pack creator"],
                    ["license", "string", "SPDX identifier (MIT, CC-BY-NC-4.0)"],
                    ["language", "string", "BCP 47 tag (en, es, ru)"],
                    ["description", "string", "Short description (max 256 chars)"],
                  ].map(([field, type, desc]) => (
                    <tr key={field} className="border-b border-surface-border/50 last:border-0">
                      <td className="px-4 py-2.5 font-mono text-text-muted text-xs">{field}</td>
                      <td className="px-4 py-2.5 font-mono text-text-dim text-xs">{type}</td>
                      <td className="px-4 py-2.5 text-text-body">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-sm font-medium text-text-primary mt-6 mb-3">
              Sound Entry
            </h3>
            <p className="text-text-body mb-4">
              Each sound in a category has <code className="font-mono text-gold text-sm">file</code> (relative path), <code className="font-mono text-gold text-sm">label</code> (human description), and optional <code className="font-mono text-gold text-sm">sha256</code> (hex digest, required for registry).
            </p>

            <h3 className="text-sm font-medium text-text-primary mt-6 mb-3">
              Example
            </h3>
            <CodeBlock
              code={MANIFEST_EXAMPLE}
              language="json"
              filename="openpeon.json"
            />
          </section>

          {/* Directory Structure */}
          <section id="directory" className="mb-12 scroll-mt-20">
            <h2 className="font-display text-xl text-text-primary mb-4">
              Directory Structure
            </h2>
            <CodeBlock code={DIRECTORY_EXAMPLE} language="text" />
            <ul className="mt-4 space-y-2 text-sm text-text-body">
              <li>Manifest <strong className="text-text-primary">MUST</strong> be named <code className="font-mono text-gold">openpeon.json</code> at pack root</li>
              <li>Audio paths use forward slashes, relative to manifest</li>
              <li>No <code className="font-mono text-gold">../</code> traversal above pack root</li>
              <li>Filenames: <code className="font-mono text-text-dim">[a-zA-Z0-9._-]+</code> only</li>
            </ul>
          </section>

          {/* Audio Constraints */}
          <section id="audio" className="mb-12 scroll-mt-20">
            <h2 className="font-display text-xl text-text-primary mb-4">
              Audio Constraints
            </h2>
            <div className="rounded-lg border border-surface-border overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-card">
                    <th className="text-left px-4 py-2.5 text-text-muted font-medium">Format</th>
                    <th className="text-left px-4 py-2.5 text-text-muted font-medium">Extension</th>
                    <th className="text-left px-4 py-2.5 text-text-muted font-medium">MIME</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["WAV", ".wav", "audio/wav"],
                    ["MP3", ".mp3", "audio/mpeg"],
                    ["OGG Vorbis", ".ogg", "audio/ogg"],
                  ].map(([format, ext, mime]) => (
                    <tr key={format} className="border-b border-surface-border/50 last:border-0">
                      <td className="px-4 py-2.5 text-text-body">{format}</td>
                      <td className="px-4 py-2.5 font-mono text-text-muted text-xs">{ext}</td>
                      <td className="px-4 py-2.5 font-mono text-text-dim text-xs">{mime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="space-y-2 text-sm text-text-body">
              <li>Individual files: max <strong className="text-text-primary">1 MB</strong></li>
              <li>Total pack: max <strong className="text-text-primary">50 MB</strong></li>
              <li>Players <strong className="text-text-primary">MUST</strong> validate magic bytes (RIFF, ID3/0xFF, OggS)</li>
            </ul>
          </section>

          {/* IDE Mapping */}
          <section id="ide-mapping" className="mb-12 scroll-mt-20">
            <h2 className="font-display text-xl text-text-primary mb-4">
              IDE Mapping
            </h2>
            <p className="text-text-body mb-4">
              Each IDE maps its own events to CESP categories. The mapping is defined by the player, not the pack.
            </p>
            <div className="rounded-lg border border-surface-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-card">
                    <th className="text-left px-4 py-2.5 text-text-muted font-medium">IDE Event</th>
                    <th className="text-left px-4 py-2.5 text-text-muted font-medium">CESP Category</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Claude Code: SessionStart", "session.start"],
                    ["Claude Code: Stop", "task.complete"],
                    ["Claude Code: UserPromptSubmit (non-rapid)", "task.acknowledge"],
                    ["Claude Code: PostToolUseFailure", "task.error"],
                    ["Claude Code: PreCompact", "resource.limit"],
                    ["Claude Code: Notification (permission)", "input.required"],
                    ["Codex: agent-turn-complete", "task.complete"],
                    ["Cursor: stop", "task.complete"],
                  ].map(([event, cat]) => (
                    <tr key={event} className="border-b border-surface-border/50 last:border-0">
                      <td className="px-4 py-2.5 text-text-body">{event}</td>
                      <td className="px-4 py-2.5 font-mono text-gold text-xs">{cat}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Player Behavior */}
          <section id="player" className="mb-12 scroll-mt-20">
            <h2 className="font-display text-xl text-text-primary mb-4">
              Player Behavior
            </h2>
            <ul className="space-y-3 text-sm text-text-body">
              <li>Players <strong className="text-text-primary">MUST</strong> pick a random sound from the category array</li>
              <li>Players <strong className="text-text-primary">SHOULD</strong> avoid repeating the last played sound (no-repeat)</li>
              <li>Players <strong className="text-text-primary">MUST</strong> support a master volume control (0.0 to 1.0)</li>
              <li>Players <strong className="text-text-primary">MUST</strong> allow individual categories to be disabled</li>
              <li>Players <strong className="text-text-primary">SHOULD</strong> support a global mute/pause toggle</li>
              <li>If a category has no sounds in the pack, the player <strong className="text-text-primary">MUST</strong> silently skip it</li>
            </ul>
          </section>

          {/* Full Spec Link */}
          <div className="rounded-lg border border-surface-border bg-surface-card p-6 text-center">
            <p className="text-text-muted mb-3">
              This is a summary. For the complete specification including JSON
              schemas:
            </p>
            <a
              href="https://github.com/PeonPing/openpeon/blob/main/spec/cesp-v1.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-lg bg-gold px-5 py-2 text-sm font-medium text-black hover:bg-gold/90 transition-colors"
            >
              Full Spec on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
