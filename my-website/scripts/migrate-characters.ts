import fs from "node:fs";
import path from "node:path";

type OldDocLink = {
  label?: string;
  doc?: string;
};

type OldCharacterImage = {
  img?: string;
  caption?: string;
};

type OldCharacter = {
  id: string;
  title: string;
  imageSrc?: string;
  subtitle?: string;
  faction?: OldDocLink;
  group?: string;
  role?: string;
  occupation?: string[];
  status?: string;
  dateOfBirth?: string;
  age?: number;
  zodiac?: string;
  mbti?: string;
  race?: string;
  dynamic?: string;
  orientation?: string;
  romantic_situation?: string;
  poli?: string;
  hometown?: OldDocLink;
  actual_location?: OldDocLink;
  realm?: OldDocLink;
  class?: string;
  subclass?: string;
  lvl?: number | string;
  firstAppearance?: OldDocLink;
  lastSeen?: OldDocLink;
  bonds?: OldDocLink[];
  destinyCard?: string;
  images?: OldCharacterImage[];
};

type OldCharactersById = Record<string, OldCharacter>;

const DASHES = new Set(["—", "-"]);

function clean(value: unknown): string | null {
  if (typeof value !== "string") return value == null ? null : String(value);
  const trimmed = value.trim();
  return DASHES.has(trimmed) ? null : trimmed;
}

function slugFromDoc(doc: string | null | undefined): string | null {
  const cleanDoc = clean(doc);
  if (!cleanDoc) return null;
  return cleanDoc.replace(/\/$/, "").split("/").at(-1) ?? null;
}

function slugify(value: string | null | undefined): string | null {
  const cleanValue = clean(value);
  if (!cleanValue) return null;
  return cleanValue
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || null;
}

function normalizeRegionId(link?: OldDocLink): string | null {
  const raw = slugFromDoc(link?.doc) ?? slugify(link?.label);
  if (raw === "ygdrassil" || raw === "yggdrassil") return "yggdrasil";
  return raw;
}

function normalizeStatus(value?: string): string {
  const map: Record<string, string> = {
    Activo: "active",
    Fallecido: "dead",
    Muerto: "dead",
    Desaparecido: "missing",
    Inactivo: "inactive",
    Desconocido: "unknown",
  };

  const cleanValue = clean(value);
  return cleanValue ? map[cleanValue] ?? slugify(cleanValue) ?? "unknown" : "unknown";
}

function normalizeDynamic(value?: string): string | null {
  const map: Record<string, string | null> = {
    Alfa: "alpha",
    Alpha: "alpha",
    Beta: "beta",
    Omega: "omega",
    Desconocido: "unknown",
    Unknown: "unknown",
    "N/A": null,
  };

  const cleanValue = clean(value);
  return cleanValue ? map[cleanValue] ?? slugify(cleanValue) : null;
}

function normalizePolyamoryStatus(value?: string): string | null {
  const map: Record<string, string | null> = {
    Sí: "yes",
    Si: "yes",
    Yes: "yes",
    yes: "yes",
    No: "no",
    no: "no",
    Descubriendo: "discovering",
    discovering: "discovering",
    Desconocido: "unknown",
    Unknown: "unknown",
  };

  const cleanValue = clean(value);
  return cleanValue ? map[cleanValue] ?? slugify(cleanValue) : null;
}

function locationLink(link?: OldDocLink) {
  const label = clean(link?.label);
  const docPath = clean(link?.doc);
  if (!label && !docPath) return null;

  return {
    label,
    locationId: docPath?.startsWith("world/locations/") ? slugFromDoc(docPath) : null,
    docPath,
  };
}

function sessionLink(link?: OldDocLink) {
  const label = clean(link?.label);
  const docPath = clean(link?.doc);
  if (!label && !docPath) return null;

  return {
    label,
    sessionId: docPath?.startsWith("campaign/sessions/") ? slugFromDoc(docPath) : null,
    docPath,
  };
}

function bondLink(link?: OldDocLink) {
  const label = clean(link?.label);
  const docPath = clean(link?.doc);
  if (!label && !docPath) return null;

  return {
    label,
    characterId: docPath?.startsWith("characters/") ? slugFromDoc(docPath) : null,
    docPath,
  };
}

function migrateCharacter(character: OldCharacter) {
  return {
    id: clean(character.id),
    title: clean(character.title),
    subtitle: clean(character.subtitle),
    imageSrc: clean(character.imageSrc),

    group: clean(character.group) === "misc" ? "npc" : clean(character.group),
    role: clean(character.role),
    occupation: character.occupation?.map(clean).filter(Boolean) ?? [],
    status: normalizeStatus(character.status),

    dateOfBirth: clean(character.dateOfBirth),
    zodiac: clean(character.zodiac),
    mbti: clean(character.mbti),

    race: clean(character.race),
    dynamic: normalizeDynamic(character.dynamic),

    orientation: clean(character.orientation),
    romanticSituation: clean(character.romantic_situation),
    polyamoryStatus: normalizePolyamoryStatus(character.poli),

    factionId: slugFromDoc(character.faction?.doc),
    regionId: normalizeRegionId(character.realm),

    hometown: locationLink(character.hometown),
    currentLocation: locationLink(character.actual_location),

    firstAppearance: sessionLink(character.firstAppearance),
    lastSeen: sessionLink(character.lastSeen),

    bonds: character.bonds?.map(bondLink).filter(Boolean) ?? [],
    destinyCard: clean(character.destinyCard),
    images: character.images
      ?.map((image) => ({ src: clean(image.img), caption: clean(image.caption) }))
      .filter((image) => image.src) ?? [],

    tags: [],
    summary: null,
  };
}

const inputPath = path.join(process.cwd(), "src/data/characters.json");
const outputPath = path.join(process.cwd(), "src/data/characters.json");
const backupPath = path.join(process.cwd(), "src/data/characters.backup.json");

const raw = JSON.parse(fs.readFileSync(inputPath, "utf8")) as OldCharactersById;
const migrated = Object.fromEntries(
  Object.entries(raw).map(([id, character]) => [id, migrateCharacter(character)]),
);

fs.writeFileSync(backupPath, JSON.stringify(raw, null, 2) + "\n");
fs.writeFileSync(outputPath, JSON.stringify(migrated, null, 2) + "\n");

console.log(`Migrated ${Object.keys(migrated).length} characters.`);
console.log(`Backup created at ${backupPath}`);
