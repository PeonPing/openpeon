import { Suspense } from "react";
import type { Metadata } from "next";
import { RequestsClient } from "./RequestsClient";

export const metadata: Metadata = {
  title: "Pack Requests",
  description:
    "Request new CESP sound packs and upvote community suggestions for OpenPeon.",
};

export default function RequestsPage() {
  return (
    <Suspense>
      <RequestsClient />
    </Suspense>
  );
}
