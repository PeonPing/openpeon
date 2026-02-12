import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/ui/CodeBlock";

export const metadata: Metadata = {
  title: "Create a Sound Pack",
  description:
    "Step-by-step guide to creating a CESP-compatible sound pack for agentic IDEs.",
};

const TEMPLATE = `{
  "cesp_version": "1.0",
  "name": "my-pack",
  "display_name": "My Sound Pack",
  "version": "1.0.0",
  "description": "Short description of your pack",
  "author": {
    "name": "Your Name",
    "github": "your-github-username"
  },
  "license": "CC-BY-NC-4.0",
  "language": "en",
  "categories": {
    "session.start": {
      "sounds": [
        { "file": "sounds/greeting.mp3", "label": "Hello!" }
      ]
    },
    "task.complete": {
      "sounds": [
        { "file": "sounds/done.mp3", "label": "Task done" }
      ]
    },
    "task.error": {
      "sounds": [
        { "file": "sounds/error.mp3", "label": "Oops" }
      ]
    },
    "input.required": {
      "sounds": [
        { "file": "sounds/attention.mp3", "label": "Need input" }
      ]
    }
  }
}`;

const STEPS = [
  {
    title: "1. Gather your sounds",
    content: (
      <>
        <p className="text-text-body mb-3">
          You need audio files for at least a few CESP categories. Game voice
          lines, movie quotes, or original recordings all work. Aim for 2-3
          sounds per category for variety.
        </p>
        <div className="rounded-lg border border-surface-border bg-surface-card p-4 mb-3">
          <p className="text-sm text-text-muted mb-2">Requirements:</p>
          <ul className="text-sm text-text-body space-y-1">
            <li>
              Formats: <code className="font-mono text-gold">.wav</code>,{" "}
              <code className="font-mono text-gold">.mp3</code>, or{" "}
              <code className="font-mono text-gold">.ogg</code>
            </li>
            <li>Max 1 MB per file, 50 MB total</li>
            <li>
              Filenames: letters, numbers, dots, hyphens, underscores only
            </li>
            <li>Short clips work best (1-5 seconds)</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    title: "2. Create directory structure",
    content: (
      <CodeBlock
        code={`my-pack/
  openpeon.json
  sounds/
    greeting.mp3
    done.mp3
    error.mp3
    attention.mp3`}
        language="text"
      />
    ),
  },
  {
    title: "3. Write your manifest",
    content: (
      <>
        <p className="text-text-body mb-3">
          Create an{" "}
          <code className="font-mono text-gold">openpeon.json</code> at the
          pack root. Here is a starter template:
        </p>
        <CodeBlock code={TEMPLATE} language="json" filename="openpeon.json" />
      </>
    ),
  },
  {
    title: "4. Publish to GitHub",
    content: (
      <>
        <p className="text-text-body mb-3">
          Create a public GitHub repo for your pack (e.g.,{" "}
          <code className="font-mono text-text-muted">yourname/openpeon-mypack</code>).
          Push your files and tag a release:
        </p>
        <CodeBlock
          code={`git init && git add -A && git commit -m "Initial commit"
git remote add origin https://github.com/yourname/openpeon-mypack.git
git push -u origin main
git tag v1.0.0 && git push origin v1.0.0`}
          language="bash"
        />
      </>
    ),
  },
  {
    title: "5. Register your pack",
    content: (
      <>
        <p className="text-text-body mb-3">
          Submit your pack to the{" "}
          <a
            href="https://github.com/PeonPing/registry"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            OpenPeon registry
          </a>{" "}
          so it can be discovered and installed:
        </p>
        <ol className="text-sm text-text-body space-y-2 list-decimal list-inside">
          <li>
            Fork{" "}
            <a
              href="https://github.com/PeonPing/registry"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              PeonPing/registry
            </a>
          </li>
          <li>
            Create <code className="font-mono text-text-muted">packs/my-pack/registry.json</code> with
            your pack metadata and source repo info
          </li>
          <li>Open a pull request</li>
        </ol>
        <p className="text-sm text-text-dim mt-3">
          See the{" "}
          <a
            href="https://github.com/PeonPing/registry/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-gold"
          >
            registry contributing guide
          </a>{" "}
          for the full registry.json format and submission details.
        </p>
      </>
    ),
  },
];

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl text-text-primary mb-2">
        Create a Sound Pack
      </h1>
      <p className="text-text-muted mb-10">
        Build a CESP-compatible pack in five steps.
      </p>

      <div className="space-y-10">
        {STEPS.map(({ title, content }) => (
          <section key={title}>
            <h2 className="font-display text-xl text-text-primary mb-4">
              {title}
            </h2>
            {content}
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-lg border border-surface-border bg-surface-card p-6 text-center">
        <p className="text-text-muted mb-3">
          Need more details on the manifest format?
        </p>
        <Link
          href="/spec"
          className="inline-flex rounded-lg bg-gold px-5 py-2 text-sm font-medium text-black hover:bg-gold/90 transition-colors"
        >
          Read the full spec
        </Link>
      </div>
    </div>
  );
}
