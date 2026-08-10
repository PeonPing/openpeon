import type { Metadata } from "next";
import { PreviewClient } from "./PreviewClient";
import { EvalGateCallout } from "@/components/EvalGateCallout";

export const metadata: Metadata = {
  title: "Pack Preview",
  description:
    "Test any CESP sound pack from a GitHub repo. Enter a repo path to preview all sounds.",
};

export default function PreviewPage() {
  return (
    <>
      <PreviewClient />
      <div className="mx-auto max-w-3xl px-5 sm:px-6 pb-12">
        <EvalGateCallout variant="remix" />
      </div>
    </>
  );
}
