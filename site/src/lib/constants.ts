import type { FranchiseInfo } from "./types";

export const REGISTRY_TAG = "registry" as const;

export const LANGUAGE_LABELS: Record<string, string> = {
  en: "English (EN)",
  es: "Español (ES)",
  fr: "Français (FR)",
  de: "Deutsch (DE)",
  ru: "Русский (RU)",
  cs: "Čeština (CS)",
  pl: "Polski (PL)",
  el: "Ελληνικά (EL)",
  pt: "Português (PT)",
  "pt-br": "Português (PT-BR)",
  zh: "中文 (ZH)",
  ja: "日本語 (JA)",
  ko: "한국어 (KO)",
  it: "Italiano (IT)",
  nl: "Nederlands (NL)",
  sv: "Svenska (SV)",
  da: "Dansk (DA)",
  fi: "Suomi (FI)",
  no: "Norsk (NO)",
  tr: "Türkçe (TR)",
  sk: "Slovenčina (SK)",
  ar: "العربية (AR)",
  unknown: "Unknown",
};

// Fallback: resolve franchise from registry tags when pack isn't in FRANCHISE_MAP.
// Keyed by franchise name; tags lists all registry tags that identify this franchise.
const FRANCHISES: Record<
  string,
  { url: string; tags: string[]; packs?: string[] }
> = {
  "Age of Empires": {
    url: "https://www.ageofempires.com",
    tags: ["age-of-empires", "aoe"],
  },
  "Age of Mythology": {
    url: "https://www.ageofempires.com/games/aom/",
    tags: ["age-of-mythology", "aom"],
  },
  "A Few Good Men": {
    url: "https://en.wikipedia.org/wiki/A_Few_Good_Men",
    tags: [],
    packs: ["afewgoodmen"],
  },
  "Airplane!": {
    url: "https://en.wikipedia.org/wiki/Airplane!",
    tags: [],
    packs: ["airplane"],
  },
  Anchorman: {
    url: "https://en.wikipedia.org/wiki/Anchorman:_The_Legend_of_Ron_Burgundy",
    tags: ["anchorman"],
  },
  "Arc Raiders": {
    url: "https://en.wikipedia.org/wiki/Arc_Raiders",
    tags: ["arc-raiders"],
    packs: ["arc_raiders"],
  },
  "Arknights: Endfield": {
    url: "https://endfield.gryphline.com",
    tags: ["arknights:endfield", "明日方舟:终末地"],
  },
  "Army of Darkness": {
    url: "https://en.wikipedia.org/wiki/Army_of_Darkness",
    tags: ["army of darkness", "evil dead"],
  },
  "Charlie Sheen": {
    url: "https://en.wikipedia.org/wiki/Charlie_Sheen",
    tags: [],
    packs: ["charlie_sheen"],
  },
  "Command & Conquer": {
    url: "https://www.ea.com/games/command-and-conquer",
    tags: ["command-and-conquer", "command-conquer", "c&c", "cnc"],
  },
  "Counter-Strike": {
    url: "https://www.counter-strike.net",
    tags: ["counterstrike", "cs"],
  },
  "Czech Viral Video": {
    url: "https://en.wikipedia.org/wiki/Czech_Republic",
    tags: [],
    packs: ["milujipraci"],
  },
  Deadlock: {
    url: "https://store.steampowered.com/app/1422450/Deadlock/",
    tags: ["deadlock"],
  },
  Deadpool: {
    url: "https://en.wikipedia.org/wiki/Deadpool",
    tags: ["deadpool"],
  },
  Diablo: { url: "https://diablo.blizzard.com", tags: ["diablo"] },
  "Die Hard": {
    url: "https://en.wikipedia.org/wiki/Die_Hard",
    tags: ["die-hard", "diehard"],
    packs: ["diehard"],
  },
  "Dota 2": { url: "https://www.dota2.com", tags: ["dota2"] },
  "Duke Nukem": {
    url: "https://en.wikipedia.org/wiki/Duke_Nukem",
    tags: ["duke-nukem"],
  },
  Futurama: {
    url: "https://en.wikipedia.org/wiki/Futurama",
    tags: ["futurama"],
  },
  "Honkai: Star Rail": {
    url: "https://hsr.hoyoverse.com",
    tags: ["starrail"],
  },
  Halo: { url: "https://www.halowaypoint.com", tags: ["halo"] },
  "Harry Potter": {
    url: "https://en.wikipedia.org/wiki/Harry_Potter",
    tags: ["harry-potter"],
  },
  "Helldivers 2": {
    url: "https://store.steampowered.com/app/553850/HELLDIVERS_2/",
    tags: ["helldivers"],
  },
  "League of Legends": {
    url: "https://www.leagueoflegends.com",
    tags: ["league-of-legends"],
  },
  "Marcel Merčiak": {
    url: "https://en.wikipedia.org/wiki/Marcel_Mer%C4%8Diak",
    tags: [],
    packs: ["marcel"],
  },
  "Mulle Meck": {
    url: "https://en.wikipedia.org/wiki/Mulle_Meck",
    tags: [],
    packs: ["mullemeck"],
  },
  Marvel: {
    url: "https://en.wikipedia.org/wiki/Marvel_Cinematic_Universe",
    tags: ["marvel", "mcu"],
  },
  "Metal Gear": {
    url: "https://en.wikipedia.org/wiki/Metal_Gear",
    tags: ["metal-gear-solid", "mgs"],
  },
  Kaamelott: {
    url: "https://en.wikipedia.org/wiki/Kaamelott",
    tags: ["kaamelott"],
  },
  Minecraft: { url: "https://www.minecraft.net", tags: ["minecraft"] },
  "Office Space": {
    url: "https://en.wikipedia.org/wiki/Office_Space",
    tags: ["office-space"],
  },
  Overwatch: { url: "https://overwatch.blizzard.com", tags: ["overwatch"] },
  "Professor Layton": {
    url: "https://en.wikipedia.org/wiki/Professor_Layton",
    tags: [],
    packs: ["professor-layton"],
  },
  Portal: {
    url: "https://store.steampowered.com/app/400/Portal/",
    tags: ["portal"],
  },
  Postal: {
    url: "https://en.wikipedia.org/wiki/Postal_(video_game_series)",
    tags: ["postal"],
  },
  "Rick and Morty": {
    url: "https://en.wikipedia.org/wiki/Rick_and_Morty",
    tags: ["rick-and-morty"],
    packs: ["rick"],
  },
  "South Park": {
    url: "https://en.wikipedia.org/wiki/South_Park",
    tags: ["south-park"],
  },
  "Silicon Valley": {
    url: "https://en.wikipedia.org/wiki/Silicon_Valley_(TV_series)",
    tags: ["silicon-valley"],
  },
  "Star Trek": {
    url: "https://en.wikipedia.org/wiki/Star_Trek",
    tags: ["star-trek"],
  },
  "Star Wars": {
    url: "https://en.wikipedia.org/wiki/Star_Wars",
    tags: ["star wars", "star-wars"],
  },
  "Starship Troopers": {
    url: "https://en.wikipedia.org/wiki/Starship_Troopers_(film)",
    tags: ["starship-troopers"],
  },
  Streamers: {
    url: "",
    tags: ["streamer", "streamers", "twitch", "vtuber"],
    packs: ["otto"],
  },
  Stronghold: {
    url: "https://en.wikipedia.org/wiki/Stronghold_(2001_video_game)",
    tags: ["stronghold"],
  },
  "Super Troopers": {
    url: "https://en.wikipedia.org/wiki/Super_Troopers",
    tags: ["super-troopers"],
  },
  StarCraft: {
    url: "https://liquipedia.net/starcraft/StarCraft",
    tags: ["starcraft", "sc", "starcraft1", "sc1", "starcraft2", "sc2"],
  },
  "Team Fortress 2": {
    url: "https://store.steampowered.com/app/440/Team_Fortress_2/",
    tags: ["tf2"],
  },
  Tekken: { url: "https://en.wikipedia.org/wiki/Tekken", tags: ["tekken"] },
  Terminator: {
    url: "https://en.wikipedia.org/wiki/Terminator_(franchise)",
    tags: ["terminator"],
  },
  "The Blues Brothers": {
    url: "https://en.wikipedia.org/wiki/The_Blues_Brothers_(film)",
    tags: ["the-blues-brothers"],
  },
  "The Sopranos": {
    url: "https://en.wikipedia.org/wiki/The_Sopranos",
    tags: ["sopranos"],
    packs: ["sopranos"],
  },
  "The Big Lebowski": {
    url: "https://en.wikipedia.org/wiki/The_Big_Lebowski",
    tags: ["the-big-lebowski", "big-lebowski"],
    packs: ["the-big-lebowski"],
  },
  "The Elder Scrolls": {
    url: "https://elderscrolls.bethesda.net",
    tags: ["elder-scrolls"],
  },
  "The Legend of Zelda": { url: "https://zelda.nintendo.com", tags: ["zelda"] },
  "The Matrix": {
    url: "https://en.wikipedia.org/wiki/The_Matrix",
    tags: ["matrix"],
  },
  "The Wire": {
    url: "https://en.wikipedia.org/wiki/The_Wire",
    tags: ["the-wire"],
  },
  "The Witcher": {
    url: "https://en.wikipedia.org/wiki/The_Witcher",
    tags: ["thewitcher", "tw3"],
  },
  "Totally Spies": {
    url: "https://en.wikipedia.org/wiki/Totally_Spies!",
    tags: ["totally-spies"],
    packs: ["totally-spies-fr"],
  },
  "Trickcal Re:Vive": {
    url: "https://en.wikipedia.org/wiki/Trickcal_Re:Vive",
    tags: ["trickcal"],
  },
  "2001: A Space Odyssey": {
    url: "https://en.wikipedia.org/wiki/2001:_A_Space_Odyssey_(film)",
    tags: ["hal9000"],
  },
  "WALL-E": {
    url: "https://en.wikipedia.org/wiki/WALL-E",
    tags: ["wall-e"],
  },
  Warcraft: {
    url: "https://liquipedia.net/warcraft/Main_Page",
    tags: ["warcraft"],
  },
  "Warcraft II": {
    url: "https://liquipedia.net/warcraft/Warcraft_II",
    tags: ["warcraft2", "wc2"],
    packs: [
      "wc2_peasant",
      "wc2_peasant_pt-br",
      "wc2_sapper",
      "wc2_sappers",
      "wc2_human_ships",
      "wc2_peon_ru",
    ],
  },
  "Warcraft III": {
    url: "https://liquipedia.net/warcraft/Warcraft_III",
    tags: ["warcraft3", "wc3"],
  },
  Wolfenstein: {
    url: "https://en.wikipedia.org/wiki/Wolfenstein",
    tags: ["wolfenstein"],
  },
  Worms: {
    url: "https://en.wikipedia.org/wiki/Worms_(series)",
    tags: ["worms"],
  },
  Zoolander: {
    url: "https://en.wikipedia.org/wiki/Zoolander",
    tags: ["zoolander"],
  },
};

export const FRANCHISE_MAP: Record<string, FranchiseInfo> = Object.fromEntries(
  Object.entries(FRANCHISES).flatMap(([name, { url, tags, packs }]) =>
    [...tags, ...(packs || [])].map((key) => [key, { name, url }]),
  ),
);
