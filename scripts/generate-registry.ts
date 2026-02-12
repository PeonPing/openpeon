import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// ── Config ──────────────────────────────────────────────────────────────────
const SCRIPT_DIR = path.resolve(__dirname);
const PROJECT_DIR = path.resolve(SCRIPT_DIR, "..");
const OG_PACKS_DIR =
  process.env.OG_PACKS_DIR ||
  path.resolve(PROJECT_DIR, "../og-packs");
const OUTPUT_DIR =
  process.env.REGISTRY_OUTPUT_DIR ||
  path.resolve(PROJECT_DIR, "../registry");

// ── Tags lookup (franchise → tags) ─────────────────────────────────────────
const FRANCHISE_TAGS: Record<string, string[]> = {
  "Warcraft III": ["gaming", "warcraft", "blizzard", "rts"],
  "Warcraft II": ["gaming", "warcraft", "blizzard", "rts"],
  StarCraft: ["gaming", "starcraft", "blizzard", "rts"],
  "Command & Conquer: Red Alert 2": ["gaming", "command-and-conquer", "ea", "rts"],
  "Command & Conquer: Red Alert": ["gaming", "command-and-conquer", "ea", "rts"],
  Portal: ["gaming", "portal", "valve", "puzzle"],
  "Team Fortress 2": ["gaming", "tf2", "valve", "fps"],
  "Rick and Morty": ["tv", "animation", "comedy"],
  "The Sopranos": ["tv", "drama", "hbo"],
  "Dota 2": ["gaming", "dota2", "valve", "moba"],
  "Helldivers 2": ["gaming", "helldivers", "shooter"],
  "The Elder Scrolls": ["gaming", "elder-scrolls", "bethesda", "rpg"],
  "Duke Nukem": ["gaming", "duke-nukem", "fps", "retro"],
  "Age of Empires II": ["gaming", "age-of-empires", "rts"],
  "Age of Mythology": ["gaming", "age-of-mythology", "rts"],
};

// ── Franchise lookup (reused from generate-pack-data.ts) ────────────────────
const FRANCHISE_MAP: Record<string, { name: string; url: string }> = {
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

// ── Types ───────────────────────────────────────────────────────────────────
interface ManifestSound {
  file: string;
  label?: string;
  line?: string;
  sha256?: string;
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
  categories: Record<string, { sounds: ManifestSound[] }>;
}

interface RegistryEntry {
  name: string;
  display_name: string;
  version: string;
  description: string;
  author: { name: string; github: string };
  source: {
    type: string;
    repo: string;
    ref: string;
    path?: string;
  };
  manifest_sha256: string;
  trust_tier: string;
  categories: string[];
  language: string;
  license: string;
  total_size_bytes: number;
  sound_count: number;
  tags: string[];
  added: string;
  updated: string;
}

interface IndexEntry {
  name: string;
  display_name: string;
  version: string;
  trust_tier: string;
  categories: string[];
  language: string;
  sound_count: number;
  total_size_bytes: number;
  source_repo: string;
  source_ref: string;
  source_path?: string;
}

// ── Main ────────────────────────────────────────────────────────────────────
console.log(`[registry] Reading packs from: ${OG_PACKS_DIR}`);
console.log(`[registry] Output to: ${OUTPUT_DIR}`);

if (!fs.existsSync(OG_PACKS_DIR)) {
  console.error(`[registry] Packs source not found: ${OG_PACKS_DIR}`);
  process.exit(1);
}

const packDirs = fs
  .readdirSync(OG_PACKS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const registryEntries: RegistryEntry[] = [];
const indexEntries: IndexEntry[] = [];
const today = new Date().toISOString().split("T")[0];

for (const dir of packDirs) {
  const packDir = path.join(OG_PACKS_DIR, dir);
  const manifestPath = path.join(packDir, "openpeon.json");

  if (!fs.existsSync(manifestPath)) {
    console.warn(`[registry] Skipping ${dir}: no openpeon.json`);
    continue;
  }

  const manifestRaw = fs.readFileSync(manifestPath, "utf-8");
  const manifest: Manifest = JSON.parse(manifestRaw);
  const packName = manifest.name || dir;

  // Compute SHA-256 of manifest
  const manifestSha256 = crypto
    .createHash("sha256")
    .update(manifestRaw)
    .digest("hex");

  // Count sounds and compute total size
  let soundCount = 0;
  let totalSizeBytes = 0;
  const categoryNames: string[] = [];

  for (const [catName, catData] of Object.entries(manifest.categories)) {
    categoryNames.push(catName);
    soundCount += catData.sounds.length;
  }

  // Calculate total audio file size
  const soundsDir = path.join(packDir, "sounds");
  if (fs.existsSync(soundsDir)) {
    const audioFiles = fs.readdirSync(soundsDir);
    for (const f of audioFiles) {
      const fp = path.join(soundsDir, f);
      if (fs.statSync(fp).isFile()) {
        totalSizeBytes += fs.statSync(fp).size;
      }
    }
  }

  // Add manifest size
  totalSizeBytes += Buffer.byteLength(manifestRaw, "utf-8");

  // Generate description
  const franchise = FRANCHISE_MAP[packName];
  const franchiseName = franchise?.name || "Unknown";
  const description = manifest.description ||
    `${manifest.display_name} sound pack from ${franchiseName}`;

  // Generate tags
  const baseTags = FRANCHISE_TAGS[franchiseName] || [];
  const tags = [...baseTags];
  if (manifest.tags) {
    for (const t of manifest.tags) {
      if (!tags.includes(t)) tags.push(t);
    }
  }

  const entry: RegistryEntry = {
    name: packName,
    display_name: manifest.display_name,
    version: manifest.version || "1.0.0",
    description,
    author: manifest.author || { name: "Unknown", github: "" },
    source: {
      type: "github",
      repo: "PeonPing/og-packs",
      ref: "v1.0.0",
      path: packName,
    },
    manifest_sha256: manifestSha256,
    trust_tier: "official",
    categories: categoryNames,
    language: manifest.language || "en",
    license: manifest.license || "CC-BY-NC-4.0",
    total_size_bytes: totalSizeBytes,
    sound_count: soundCount,
    tags,
    added: today,
    updated: today,
  };

  registryEntries.push(entry);

  // Write registry.json for this pack
  const packOutDir = path.join(OUTPUT_DIR, "packs", packName);
  fs.mkdirSync(packOutDir, { recursive: true });
  fs.writeFileSync(
    path.join(packOutDir, "registry.json"),
    JSON.stringify(entry, null, 2) + "\n"
  );

  // Build index entry
  indexEntries.push({
    name: packName,
    display_name: manifest.display_name,
    version: manifest.version || "1.0.0",
    trust_tier: "official",
    categories: categoryNames,
    language: manifest.language || "en",
    sound_count: soundCount,
    total_size_bytes: totalSizeBytes,
    source_repo: "PeonPing/og-packs",
    source_ref: "v1.0.0",
    source_path: packName,
  });
}

// Write index.json
const index = {
  version: 1,
  generated_at: new Date().toISOString(),
  packs: indexEntries,
};

fs.writeFileSync(
  path.join(OUTPUT_DIR, "index.json"),
  JSON.stringify(index, null, 2) + "\n"
);

console.log(
  `[registry] Done: ${registryEntries.length} registry entries, index.json generated`
);
