export interface SoundEntry {
  file: string;
  label: string;
  audioUrl: string;
}

export interface CategoryData {
  name: string;
  sounds: SoundEntry[];
}

export interface FranchiseInfo {
  name: string;
  url: string;
}

export interface PackMeta {
  name: string;
  displayName: string;
  version: string;
  author: { name: string; github: string };
  license: string;
  language: string;
  languageLabel: string;
  description?: string;
  tags?: string[];
  trustTier: string;
  franchise: FranchiseInfo;
  categories: CategoryData[];
  categoryNames: string[];
  totalSoundCount: number;
  previewSounds: SoundEntry[];
  sourceRepo?: string;
  sourcePath?: string;
}

export interface PacksData {
  generatedAt: string;
  packs: PackMeta[];
}
