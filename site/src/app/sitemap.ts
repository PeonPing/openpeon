import type { MetadataRoute } from "next";
import { getAllPacks } from "@/lib/packs";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const packs = getAllPacks();

  const packPages = packs.map((pack) => ({
    url: `https://openpeon.com/packs/${pack.name}`,
    lastModified: new Date(),
  }));

  return [
    { url: "https://openpeon.com", lastModified: new Date() },
    { url: "https://openpeon.com/packs", lastModified: new Date() },
    { url: "https://openpeon.com/spec", lastModified: new Date() },
    { url: "https://openpeon.com/create", lastModified: new Date() },
    { url: "https://openpeon.com/integrate", lastModified: new Date() },
    { url: "https://openpeon.com/tracker", lastModified: new Date() },
    { url: "https://openpeon.com/requests", lastModified: new Date() },
    { url: "https://openpeon.com/preview", lastModified: new Date() },
    ...packPages,
  ];
}
