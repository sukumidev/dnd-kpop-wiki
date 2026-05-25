/**
 * migrate-quest-tags.ts
 *
 * US-037 — Tag migration
 *
 * Migrates quests from:
 *   tags: string[]
 *
 * to:
 *   tagIds: string[]
 *
 * Also creates or updates:
 *   src/data/tags.json
 *
 * Run:
 *   npx tsx scripts/migrate-quest-tags.ts
 */

import fs from "node:fs";
import path from "node:path";

type JsonRecord = Record<string, any>;

type TagCategory =
  | "region"
  | "faction"
  | "arc"
  | "theme"
  | "species"
  | "magic"
  | "narrative"
  | "character"
  | "lore"
  | "other";

const PROJECT_ROOT = process.cwd();
const DATA_DIR = path.join(PROJECT_ROOT, "src", "data");
const QUESTS_PATH = path.join(DATA_DIR, "quests.json");
const TAGS_PATH = path.join(DATA_DIR, "tags.json");

const ID_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleize(tagId: string): string {
  const special: Record<string, string> = {
    "neo-academia": "Neo Academia",
    "sol-ardiente": "Sol Ardiente",
    "baraja-del-destino": "Baraja del Destino",
    "radiancia-disenada": "Radiancia Diseñada",
    "rey-de-corazones": "Rey de Corazones",
    "casa-de-los-deseos": "Casa de los Deseos",
    "gremio-de-aventureros": "Gremio de Aventureros",
    "heraldos-del-crepusculo": "Heraldos del Crepúsculo",
    "jungwoo-bebe": "Jungwoo bebé",
    "jackson-wang": "Jackson Wang",
    "monstruos-x": "Monstruos X",
    "luz-de-la-luna": "Luz de la Luna",
    "vidas-pasadas": "Vidas pasadas",
  };

  return special[tagId] ?? tagId.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

const CATEGORY_BY_TAG_ID: Record<string, TagCategory> = {
  sylmorien: "region",
  hotou: "region",

  "sol-ardiente": "faction",
  "neo-academia": "faction",
  "gremio-de-aventureros": "faction",
  "heraldos-del-crepusculo": "faction",
  "casa-de-los-deseos": "faction",
  "monstruos-x": "faction",
  seventeenos: "faction",

  minjae: "character",
  kiyori: "character",
  imugi: "character",
  soobin: "character",
  taeil: "character",
  mark: "character",
  hyungwon: "character",
  "jackson-wang": "character",
  joshua: "character",
  seunghan: "character",
  faker: "character",
  "jungwoo-bebe": "character",

  "arco-personal": "arc",
  "baraja-del-destino": "arc",
  "cartas-robadas": "arc",
  portadores: "arc",

  "radiancia-disenada": "magic",
  ritual: "magic",
  pacto: "magic",
  almas: "magic",
  magia: "magic",
  "luz-de-la-luna": "magic",
  "rey-de-corazones": "magic",

  destino: "lore",
  cartas: "lore",
  "cartas-legendarias": "lore",
  "vidas-pasadas": "lore",

  proteccion: "narrative",
  rescate: "narrative",
  recuperacion: "narrative",
  investigacion: "narrative",
  guerra: "narrative",
  defensa: "narrative",
  secuestro: "narrative",

  vampiros: "species",
  wishitos: "species",
};

function readJson(filePath: string, fallback: JsonRecord = {}): JsonRecord {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function main() {
  const quests = readJson(QUESTS_PATH);
  const existingTags = readJson(TAGS_PATH);

  const nextTags: JsonRecord = { ...existingTags };
  const nextQuests: JsonRecord = {};

  for (const [questId, quest] of Object.entries(quests)) {
    const rawQuest = quest as JsonRecord;
    const rawTags = Array.isArray(rawQuest.tags)
      ? rawQuest.tags
      : Array.isArray(rawQuest.tagIds)
        ? rawQuest.tagIds
        : [];

    const tagIds = unique(
      rawTags
        .map((tag) => slugify(String(tag)))
        .filter((tagId) => ID_REGEX.test(tagId)),
    );

    for (const tagId of tagIds) {
      if (!nextTags[tagId]) {
        nextTags[tagId] = {
          id: tagId,
          title: titleize(tagId),
          category: CATEGORY_BY_TAG_ID[tagId] ?? "theme",
          status: "active",
          description: null,
        };
      }
    }

    const { tags, ...rest } = rawQuest;

    nextQuests[questId] = {
      ...rest,
      tagIds,
    };
  }

  writeJson(QUESTS_PATH, nextQuests);
  writeJson(TAGS_PATH, Object.fromEntries(Object.entries(nextTags).sort(([a], [b]) => a.localeCompare(b))));

  console.log("✅ Migrated quests tags -> tagIds");
  console.log(`✅ Updated ${QUESTS_PATH}`);
  console.log(`✅ Updated ${TAGS_PATH}`);
}

main();
