import type { Metadata } from "next";
import { TrackerClient } from "./TrackerClient";

export const metadata: Metadata = {
  title: "Registry Tracker",
  description:
    "Live status of accepted and pending CESP sound packs in the OpenPeon registry.",
};

export default function TrackerPage() {
  return <TrackerClient />;
}
