import packsDataJson from "@/data/packs-data.json";
import type { PackMeta, PacksData } from "./types";

const packsData = packsDataJson as PacksData;

export function getAllPacks(): PackMeta[] {
  return packsData.packs;
}

export function getPack(name: string): PackMeta | undefined {
  return packsData.packs.find((p) => p.name === name);
}

export function getPackNames(): string[] {
  return packsData.packs.map((p) => p.name);
}

export function getLanguages(): string[] {
  const langs = new Set(packsData.packs.map((p) => p.language));
  return Array.from(langs).sort();
}

export function getLanguageLabels(): { code: string; label: string }[] {
  const map = new Map<string, string>();
  for (const p of packsData.packs) {
    if (!map.has(p.language)) {
      map.set(p.language, p.languageLabel);
    }
  }
  return Array.from(map.entries())
    .map(([code, label]) => ({ code, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
