import type { Metadata } from "next";
import { CodeBlock } from "@/components/ui/CodeBlock";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Add Sound Packs to Your CLI",
  description:
    "Copy one block into your AI coding agent. It reads your codebase and wires up CESP sound pack support.",
  openGraph: {
    title: "Add Sound Packs to Your CLI",
    description:
      "One block. Paste it into your AI coding agent. 100+ sound packs, zero audio work.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Sound Packs to Your CLI",
    description:
      "One block. Paste it into your AI coding agent. 100+ sound packs, zero audio work.",
  },
};

// Read INTEGRATE.md from the repo root at build time
const AGENT_SKILL = fs.readFileSync(
  path.join(process.cwd(), "..", "INTEGRATE.md"),
  "utf-8"
);

export default function IntegratePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl text-text-primary mb-2">
        Add Sound Packs to Your CLI
      </h1>
      <p className="text-text-muted mb-4">
        One block. Paste it into your AI coding agent with your CLI open. Done.
      </p>

      <div className="rounded-lg border border-gold/30 bg-gold/5 px-5 py-4 mb-8">
        <p className="text-sm">
          <span className="text-text-primary font-medium">Your human job:</span>{" "}
          <span className="text-text-muted">
            Copy the block below. Paste it into Claude Code / Codex / Cursor / whatever you vibe with.
          </span>
        </p>
        <p className="text-sm mt-1">
          <span className="text-text-primary font-medium">
            Your agent&apos;s job:
          </span>{" "}
          <span className="text-text-muted">
            Everything else.
          </span>
        </p>
        <div className="mt-3 pt-3 border-t border-gold/10">
          <p className="text-xs text-text-dim">
            This is for you if you&apos;re building a CLI tool and want sounds without recording audio,
            building an AI agent or coding tool that needs status feedback,
            or just want GLaDOS in your deploy script.
          </p>
        </div>
      </div>

      <CodeBlock code={AGENT_SKILL} language="markdown" />
    </div>
  );
}
