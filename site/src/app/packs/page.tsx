import { Suspense } from "react";
import type { Metadata } from "next";
import { PacksClient } from "./PacksClient";

export const metadata: Metadata = {
  title: "Sound Packs",
  description:
    "Browse CESP-compatible sound packs for Claude Code, Cursor, Codex, and any agentic IDE.",
};

export default function PacksPage() {
  return (
    <Suspense>
      <PacksClient />
    </Suspense>
  );
}
