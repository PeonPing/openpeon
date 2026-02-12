import * as fs from "fs";
import * as path from "path";

// ── Franchise lookup ────────────────────────────────────────────────────────
interface Franchise {
  name: string;
  url: string;
}

const FRANCHISE_MAP: Record<string, Franchise> = {
  peon: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peon_es: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peon_fr: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peon_cz: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peon_pl: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peon_ru: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peasant: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peasant_cz: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peasant_es: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peasant_fr: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  peasant_ru: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  acolyte_ru: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  brewmaster_ru: { name: "Warcraft III", url: "https://liquipedia.net/warcraft/Warcraft_III" },
  wc2_peasant: { name: "Warcraft II", url: "https://liquipedia.net/warcraft/Warcraft_II" },
  sc_kerrigan: { name: "StarCraft", url: "https://liquipedia.net/starcraft/StarCraft" },
  sc_battlecruiser: { name: "StarCraft", url: "https://liquipedia.net/starcraft/StarCraft" },
  sc_terran: { name: "StarCraft", url: "https://liquipedia.net/starcraft/StarCraft" },
  sc_scv: { name: "StarCraft", url: "https://liquipedia.net/starcraft/StarCraft" },
  sc_firebat: { name: "StarCraft", url: "https://liquipedia.net/starcraft/StarCraft" },
  sc_medic: { name: "StarCraft", url: "https://liquipedia.net/starcraft/StarCraft" },
  sc_tank: { name: "StarCraft", url: "https://liquipedia.net/starcraft/StarCraft" },
  sc_vessel: { name: "StarCraft", url: "https://liquipedia.net/starcraft/StarCraft" },
  ra2_kirov: { name: "Command & Conquer: Red Alert 2", url: "https://www.ea.com/games/command-and-conquer" },
  ra2_soviet_engineer: { name: "Command & Conquer: Red Alert 2", url: "https://www.ea.com/games/command-and-conquer" },
  ra_soviet: { name: "Command & Conquer: Red Alert", url: "https://www.ea.com/games/command-and-conquer" },
  glados: { name: "Portal", url: "https://store.steampowered.com/app/400/Portal/" },
  tf2_engineer: { name: "Team Fortress 2", url: "https://store.steampowered.com/app/440/Team_Fortress_2/" },
  rick: { name: "Rick and Morty", url: "https://en.wikipedia.org/wiki/Rick_and_Morty" },
  sopranos: { name: "The Sopranos", url: "https://en.wikipedia.org/wiki/The_Sopranos" },
  dota2_axe: { name: "Dota 2", url: "https://www.dota2.com" },
  hd2_helldiver: { name: "Helldivers 2", url: "https://store.steampowered.com/app/553850/HELLDIVERS_2/" },
  molag_bal: { name: "The Elder Scrolls", url: "https://elderscrolls.bethesda.net" },
  sheogorath: { name: "The Elder Scrolls", url: "https://elderscrolls.bethesda.net" },
  duke_nukem: { name: "Duke Nukem", url: "https://en.wikipedia.org/wiki/Duke_Nukem" },
  aoe2: { name: "Age of Empires II", url: "https://www.ageofempires.com" },
  aom_greek: { name: "Age of Mythology", url: "https://www.ageofempires.com/games/aom/" },
};

// ── Language labels ─────────────────────────────────────────────────────────
const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  cs: "Czech",
  pl: "Polish",
  ru: "Russian",
  el: "Greek",
};

// ── Types ───────────────────────────────────────────────────────────────────
interface ManifestSound {
  file: string;
  label?: string;
  line?: string;
  sha256?: string;
}

interface ManifestCategory {
  sounds: ManifestSound[];
}

interface Manifest {
  cesp_version?: string;
  name: string;
  display_name: string;
  version?: string;
  author?: { name: string; github: string };
  license?: string;
  language?: string;
  description?: string;
  tags?: string[];
  categories: Record<string, ManifestCategory>;
}

// ── Main ────────────────────────────────────────────────────────────────────
const SITE_DIR = path.resolve(__dirname, "..");
const PACKS_SOURCE =
  process.env.PACKS_SOURCE_DIR ||
  path.resolve(SITE_DIR, "../../og-packs");
const OUTPUT_JSON = path.join(SITE_DIR, "src/data/packs-data.json");
const OUTPUT_AUDIO = path.join(SITE_DIR, "public/audio");

console.log(`[generate] Reading packs from: ${PACKS_SOURCE}`);

if (!fs.existsSync(PACKS_SOURCE)) {
  console.error(`[generate] Packs source not found: ${PACKS_SOURCE}`);
  process.exit(1);
}

const packDirs = fs
  .readdirSync(PACKS_SOURCE, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

interface PackData {
  name: string;
  displayName: string;
  version: string;
  author: { name: string; github: string };
  license: string;
  language: string;
  languageLabel: string;
  description?: string;
  tags?: string[];
  franchise: Franchise;
  categories: { name: string; sounds: { file: string; label: string; audioUrl: string }[] }[];
  categoryNames: string[];
  totalSoundCount: number;
  previewSounds: { file: string; label: string; audioUrl: string }[];
}

const packs: PackData[] = [];
let totalAudioFiles = 0;

for (const dir of packDirs) {
  const packDir = path.join(PACKS_SOURCE, dir);

  // Find manifest (prefer openpeon.json)
  let manifestPath: string | null = null;
  for (const mname of ["openpeon.json", "manifest.json"]) {
    const p = path.join(packDir, mname);
    if (fs.existsSync(p)) {
      manifestPath = p;
      break;
    }
  }
  if (!manifestPath) continue;

  const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const packName = manifest.name || dir;

  // Process categories
  const categories: PackData["categories"] = [];
  const previewSounds: PackData["previewSounds"] = [];
  let soundCount = 0;

  for (const [catName, catData] of Object.entries(manifest.categories)) {
    const sounds = (catData.sounds || []).map((s: ManifestSound) => {
      const filename = path.basename(s.file);
      return {
        file: s.file,
        label: s.label || s.line || filename,
        audioUrl: `/audio/${packName}/${filename}`,
      };
    });

    categories.push({ name: catName, sounds });
    soundCount += sounds.length;

    // Pick first sound from this category as a preview
    if (sounds.length > 0 && previewSounds.length < 6) {
      previewSounds.push(sounds[0]);
    }
  }

  // Copy audio files
  const audioOutDir = path.join(OUTPUT_AUDIO, packName);
  fs.mkdirSync(audioOutDir, { recursive: true });

  const soundsDir = path.join(packDir, "sounds");
  if (fs.existsSync(soundsDir)) {
    const audioFiles = fs.readdirSync(soundsDir);
    for (const f of audioFiles) {
      const src = path.join(soundsDir, f);
      const dest = path.join(audioOutDir, f);
      if (fs.statSync(src).isFile()) {
        fs.copyFileSync(src, dest);
        totalAudioFiles++;
      }
    }
  }

  const lang = manifest.language || "en";

  packs.push({
    name: packName,
    displayName: manifest.display_name,
    version: manifest.version || "1.0.0",
    author: manifest.author || { name: "Unknown", github: "" },
    license: manifest.license || "CC-BY-NC-4.0",
    language: lang,
    languageLabel: LANGUAGE_LABELS[lang] || lang,
    description: manifest.description,
    tags: manifest.tags,
    franchise: FRANCHISE_MAP[packName] || { name: "Unknown", url: "" },
    categories,
    categoryNames: categories.map((c) => c.name),
    totalSoundCount: soundCount,
    previewSounds,
  });
}

// Write output
fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
const output = {
  generatedAt: new Date().toISOString(),
  packs,
};
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2));

console.log(
  `[generate] Done: ${packs.length} packs, ${totalAudioFiles} audio files copied`
);
