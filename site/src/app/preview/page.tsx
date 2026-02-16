import type { Metadata } from "next";
import { PreviewClient } from "./PreviewClient";

export const metadata: Metadata = {
  title: "Pack Preview",
  description:
    "Test any CESP sound pack from a GitHub repo. Enter a repo path to preview all sounds.",
};

export default function PreviewPage() {
  return <PreviewClient />;
}
