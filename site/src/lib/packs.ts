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

export function getGeneratedAt(): string {
  return packsData.generatedAt;
}

