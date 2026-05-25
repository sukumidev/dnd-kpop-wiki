/**
 * validate-data.ts
 *
 * Sprint 0 / HS-009 — Validar IDs únicos
 *
 * Validates shared data files under src/data:
 * - characters.json
 * - quests.json
 * - factions.json
 * - locations.json
 * - mapConfig.json
 * - statblocks.json
 *
 * Run with:
 *   npx tsx scripts/validate-data.ts
 *
 * Optional package.json script:
 *   "validate:data": "tsx scripts/validate-data.ts"
 */

import fs from "node:fs";
import path from "node:path";

type Severity = "error" | "warning";

type ValidationIssue = {
  severity: Severity;
  file: string;
  entityId?: string;
  field?: string;
  message: string;
};

type JsonRecord = Record<string, any>;

const PROJECT_ROOT = process.cwd();
const DATA_DIR = path.join(PROJECT_ROOT, "src", "data");

const ID_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const issues: ValidationIssue[] = [];

const DATA_FILES = {
  characters: "characters.json",
  quests: "quests.json",
  factions: "factions.json",
  locations: "locations.json",
  mapConfig: "mapConfig.json",
  statblocks: "statblocks.json",
} as const;

const CHARACTER_STATUS = new Set(["active", "inactive", "dead", "missing", "unknown"]);
const CHARACTER_GROUP = new Set(["party", "npc"]);
const CHARACTER_DYNAMIC = new Set(["alpha", "beta", "omega", "unknown", "n/a"]);
const POLYAMORY_STATUS = new Set(["yes", "no", "discovering", "unknown", "n/a"]);

const QUEST_STATUS = new Set(["active", "completed", "failed", "paused", "hidden", "unknown"]);
const QUEST_VISIBILITY = new Set(["public", "hidden", "dm-only"]);

const FACTION_STATUS = new Set(["active", "inactive", "destroyed", "disbanded", "hidden", "unknown"]);
const LOCATION_STATUS = new Set(["active", "destroyed", "hidden", "lost", "unknown"]);

function addIssue(issue: ValidationIssue) {
  issues.push(issue);
}

function addError(file: string, message: string, entityId?: string, field?: string) {
  addIssue({ severity: "error", file, entityId, field, message });
}

function addWarning(file: string, message: string, entityId?: string, field?: string) {
  addIssue({ severity: "warning", file, entityId, field, message });
}

function filePath(fileName: string) {
  return path.join(DATA_DIR, fileName);
}

function fileExists(fileName: string) {
  return fs.existsSync(filePath(fileName));
}

function readJson<T = any>(fileName: string, required = true): T | null {
  const fullPath = filePath(fileName);

  if (!fs.existsSync(fullPath)) {
    if (required) {
      addError(fileName, `Missing required data file: ${fileName}`);
    } else {
      addWarning(fileName, `Optional data file not found: ${fileName}`);
    }

    return null;
  }

  try {
    const raw = fs.readFileSync(fullPath, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    addError(fileName, `Invalid JSON: ${(error as Error).message}`);
    return null;
  }
}

function isPlainObject(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateIdValue(file: string, id: unknown, entityId: string | undefined, field: string) {
  if (typeof id !== "string" || id.trim() === "") {
    addError(file, `Missing or invalid ID value.`, entityId, field);
    return;
  }

  if (!ID_REGEX.test(id)) {
    addError(
      file,
      `Invalid ID "${id}". IDs must use lowercase kebab-case without accents, spaces, underscores or emojis.`,
      entityId,
      field,
    );
  }
}

function validateIdArray(file: string, ids: unknown, entityId: string, field: string) {
  if (ids == null) return;

  if (!Array.isArray(ids)) {
    addError(file, `Expected ${field} to be an array of IDs.`, entityId, field);
    return;
  }

  const seen = new Set<string>();

  ids.forEach((id, index) => {
    const fieldPath = `${field}[${index}]`;

    if (typeof id !== "string") {
      addError(file, `Expected ${fieldPath} to be a string ID.`, entityId, fieldPath);
      return;
    }

    validateIdValue(file, id, entityId, fieldPath);

    if (seen.has(id)) {
      addError(file, `Duplicate ID "${id}" inside ${field}.`, entityId, fieldPath);
    }

    seen.add(id);
  });
}

function validateRecordFile(file: string, data: unknown): JsonRecord {
  if (!isPlainObject(data)) {
    addError(file, `Expected ${file} to be a Record<string, Entity>.`);
    return {};
  }

  for (const [key, entity] of Object.entries(data)) {
    if (!isPlainObject(entity)) {
      addError(file, `Expected entity "${key}" to be an object.`, key);
      continue;
    }

    validateIdValue(file, key, key, "recordKey");

    if (!("id" in entity)) {
      addError(file, `Entity is missing required "id".`, key, "id");
      continue;
    }

    validateIdValue(file, entity.id, key, "id");

    if (typeof entity.id === "string" && key !== entity.id) {
      addError(file, `Record key "${key}" does not match internal id "${entity.id}".`, key, "id");
    }

    if (!entity.title && file !== DATA_FILES.statblocks) {
      addError(file, `Entity is missing required "title".`, key, "title");
    }
  }

  return data;
}

function validateNestedUniqueIds(
  file: string,
  parentId: string,
  items: unknown,
  field: string,
  required = false,
) {
  if (items == null) {
    if (required) {
      addError(file, `Missing required array ${field}.`, parentId, field);
    }
    return;
  }

  if (!Array.isArray(items)) {
    addError(file, `Expected ${field} to be an array.`, parentId, field);
    return;
  }

  const seen = new Set<string>();

  items.forEach((item, index) => {
    const fieldPath = `${field}[${index}]`;

    if (!isPlainObject(item)) {
      addError(file, `Expected ${fieldPath} to be an object.`, parentId, fieldPath);
      return;
    }

    if (!("id" in item)) {
      addError(file, `Missing id in ${fieldPath}.`, parentId, `${fieldPath}.id`);
      return;
    }

    validateIdValue(file, item.id, parentId, `${fieldPath}.id`);

    if (typeof item.id === "string") {
      if (seen.has(item.id)) {
        addError(file, `Duplicate nested ID "${item.id}" inside ${field}.`, parentId, `${fieldPath}.id`);
      }

      seen.add(item.id);
    }
  });
}

function validateEnum(
  file: string,
  value: unknown,
  allowed: Set<string>,
  entityId: string,
  field: string,
  required = false,
) {
  if (value == null) {
    if (required) {
      addError(file, `Missing required field "${field}".`, entityId, field);
    }
    return;
  }

  if (typeof value !== "string" || !allowed.has(value)) {
    addError(
      file,
      `Invalid ${field} "${String(value)}". Allowed values: ${Array.from(allowed).join(", ")}`,
      entityId,
      field,
    );
  }
}

function validateTags(file: string, tags: unknown, entityId: string) {
  if (tags == null) return;

  if (!Array.isArray(tags)) {
    addError(file, `Expected tags to be an array.`, entityId, "tags");
    return;
  }

  const seen = new Set<string>();

  tags.forEach((tag, index) => {
    const field = `tags[${index}]`;

    if (typeof tag !== "string") {
      addError(file, `Expected ${field} to be a string.`, entityId, field);
      return;
    }

    validateIdValue(file, tag, entityId, field);

    if (seen.has(tag)) {
      addWarning(file, `Duplicate tag "${tag}".`, entityId, field);
    }

    seen.add(tag);
  });
}

function collectIds(record: JsonRecord) {
  return new Set(Object.keys(record));
}

function warnMissingReferences(
  file: string,
  sourceIds: unknown,
  targetIds: Set<string>,
  entityId: string,
  field: string,
) {
  if (!Array.isArray(sourceIds)) return;

  sourceIds.forEach((id, index) => {
    if (typeof id !== "string") return;

    if (!targetIds.has(id)) {
      addWarning(file, `Reference "${id}" does not exist yet.`, entityId, `${field}[${index}]`);
    }
  });
}

function warnMissingReference(
  file: string,
  sourceId: unknown,
  targetIds: Set<string>,
  entityId: string,
  field: string,
) {
  if (sourceId == null) return;
  if (typeof sourceId !== "string") return;

  if (!targetIds.has(sourceId)) {
    addWarning(file, `Reference "${sourceId}" does not exist yet.`, entityId, field);
  }
}

function validateCharacters(characters: JsonRecord, factionIds: Set<string>, locationIds: Set<string>) {
  const file = DATA_FILES.characters;
  const removedFields = [
    "age",
    "class",
    "subclass",
    "lvl",
    "realm",
    "faction",
    "actual_location",
    "poli",
    "romantic_situation",
  ];

  for (const [id, character] of Object.entries(characters)) {
    if (!isPlainObject(character)) continue;

    validateEnum(file, character.group, CHARACTER_GROUP, id, "group", true);
    validateEnum(file, character.status, CHARACTER_STATUS, id, "status", true);
    validateEnum(file, character.dynamic, CHARACTER_DYNAMIC, id, "dynamic");
    validateEnum(file, character.polyamoryStatus, POLYAMORY_STATUS, id, "polyamoryStatus");

    if (character.factionId != null) {
      validateIdValue(file, character.factionId, id, "factionId");
      warnMissingReference(file, character.factionId, factionIds, id, "factionId");
    }

    if (character.regionId != null) {
      validateIdValue(file, character.regionId, id, "regionId");
      warnMissingReference(file, character.regionId, locationIds, id, "regionId");
    }

    validateIdArray(file, character.locationIds, id, "locationIds");
    validateIdArray(file, character.questIds, id, "questIds");
    validateTags(file, character.tags, id);

    for (const field of removedFields) {
      if (field in character) {
        addError(file, `Removed legacy field "${field}" must not exist in characters.json.`, id, field);
      }
    }

    if (!character.imageSrc) {
      addWarning(file, `Character has no imageSrc.`, id, "imageSrc");
    }
  }
}

function validateQuests(
  quests: JsonRecord,
  characterIds: Set<string>,
  factionIds: Set<string>,
  locationIds: Set<string>,
) {
  const file = DATA_FILES.quests;

  for (const [id, quest] of Object.entries(quests)) {
    if (!isPlainObject(quest)) continue;

    if (!Array.isArray(quest.types) || quest.types.length === 0) {
      addError(file, `Quest must have at least one type.`, id, "types");
    } else {
      validateIdArray(file, quest.types, id, "types");
    }

    validateEnum(file, quest.status, QUEST_STATUS, id, "status", true);
    validateEnum(file, quest.visibility, QUEST_VISIBILITY, id, "visibility", true);

    validateIdArray(file, quest.characterIds, id, "characterIds");
    validateIdArray(file, quest.factionIds, id, "factionIds");
    validateIdArray(file, quest.regionIds, id, "regionIds");
    validateIdArray(file, quest.locationIds, id, "locationIds");

    warnMissingReferences(file, quest.characterIds, characterIds, id, "characterIds");
    warnMissingReferences(file, quest.factionIds, factionIds, id, "factionIds");
    warnMissingReferences(file, quest.regionIds, locationIds, id, "regionIds");
    warnMissingReferences(file, quest.locationIds, locationIds, id, "locationIds");

    if (quest.parentQuestId != null) {
      validateIdValue(file, quest.parentQuestId, id, "parentQuestId");
      warnMissingReference(file, quest.parentQuestId, collectIds(quests), id, "parentQuestId");
    }

    if (quest.sessionStartedId != null) {
      validateIdValue(file, quest.sessionStartedId, id, "sessionStartedId");
    }

    if (quest.lastUpdatedSessionId != null) {
      validateIdValue(file, quest.lastUpdatedSessionId, id, "lastUpdatedSessionId");
    }

    validateNestedUniqueIds(file, id, quest.objectives, "objectives");
    validateTags(file, quest.tags, id);

    if (!quest.summary) {
      addWarning(file, `Quest has no summary.`, id, "summary");
    }
  }
}

function validateFactions(factions: JsonRecord, characterIds: Set<string>, locationIds: Set<string>) {
  const file = DATA_FILES.factions;

  for (const [id, faction] of Object.entries(factions)) {
    if (!isPlainObject(faction)) continue;

    validateEnum(file, faction.status, FACTION_STATUS, id, "status");

    if (faction.regionId != null) {
      validateIdValue(file, faction.regionId, id, "regionId");
      warnMissingReference(file, faction.regionId, locationIds, id, "regionId");
    }

    if (faction.baseLocationId != null) {
      validateIdValue(file, faction.baseLocationId, id, "baseLocationId");
      warnMissingReference(file, faction.baseLocationId, locationIds, id, "baseLocationId");
    }

    if (faction.leaderCharacterId != null) {
      validateIdValue(file, faction.leaderCharacterId, id, "leaderCharacterId");
      warnMissingReference(file, faction.leaderCharacterId, characterIds, id, "leaderCharacterId");
    }

    validateIdArray(file, faction.allyFactionIds, id, "allyFactionIds");
    validateIdArray(file, faction.rivalFactionIds, id, "rivalFactionIds");

    warnMissingReferences(file, faction.allyFactionIds, collectIds(factions), id, "allyFactionIds");
    warnMissingReferences(file, faction.rivalFactionIds, collectIds(factions), id, "rivalFactionIds");

    validateNestedUniqueIds(file, id, faction.subunits, "subunits");

    if (Array.isArray(faction.subunits)) {
      faction.subunits.forEach((subunit: unknown, index: number) => {
        if (!isPlainObject(subunit)) return;

        const subunitField = `subunits[${index}]`;

        if (subunit.leaderCharacterId != null) {
          validateIdValue(file, subunit.leaderCharacterId, id, `${subunitField}.leaderCharacterId`);
          warnMissingReference(file, subunit.leaderCharacterId, characterIds, id, `${subunitField}.leaderCharacterId`);
        }

        validateIdArray(file, subunit.memberIds, id, `${subunitField}.memberIds`);
        warnMissingReferences(file, subunit.memberIds, characterIds, id, `${subunitField}.memberIds`);
      });
    }

    validateTags(file, faction.tags, id);

    if ("keyMembers" in faction) {
      addError(file, `Legacy field "keyMembers" must not be used as source of truth.`, id, "keyMembers");
    }
  }
}

function validateLocations(locations: JsonRecord, mapConfig: any) {
  const file = DATA_FILES.locations;

  const layerIds = new Set<string>(
    Array.isArray(mapConfig?.layers) ? mapConfig.layers.map((layer: any) => layer.id).filter(Boolean) : [],
  );

  const iconIds = new Set<string>(
    Array.isArray(mapConfig?.icons) ? mapConfig.icons.map((icon: any) => icon.id).filter(Boolean) : [],
  );

  for (const [id, location] of Object.entries(locations)) {
    if (!isPlainObject(location)) continue;

    validateEnum(file, location.status, LOCATION_STATUS, id, "status");

    if (location.regionId != null) {
      validateIdValue(file, location.regionId, id, "regionId");
      warnMissingReference(file, location.regionId, collectIds(locations), id, "regionId");
    }

    if (location.parentLocationId != null) {
      validateIdValue(file, location.parentLocationId, id, "parentLocationId");
      warnMissingReference(file, location.parentLocationId, collectIds(locations), id, "parentLocationId");
    }

    validateIdArray(file, location.factionIds, id, "factionIds");
    validateIdArray(file, location.characterIds, id, "characterIds");
    validateIdArray(file, location.questIds, id, "questIds");
    validateTags(file, location.tags, id);

    const map = location.map;

    if (map == null) continue;

    if (!isPlainObject(map)) {
      addError(file, `Expected map to be an object.`, id, "map");
      continue;
    }

    if (typeof map.visible !== "boolean") {
      addError(file, `Expected map.visible to be boolean.`, id, "map.visible");
    }

    if (map.visible === true) {
      if (typeof map.x !== "number" || typeof map.y !== "number") {
        addError(file, `Visible map location must include numeric x and y.`, id, "map");
      }
    }

    if (typeof map.x === "number" && (map.x < 0 || map.x > 100)) {
      addError(file, `map.x must be between 0 and 100.`, id, "map.x");
    }

    if (typeof map.y === "number" && (map.y < 0 || map.y > 100)) {
      addError(file, `map.y must be between 0 and 100.`, id, "map.y");
    }

    if (map.layer != null) {
      validateIdValue(file, map.layer, id, "map.layer");

      if (!layerIds.has(map.layer)) {
        addWarning(file, `Map layer "${map.layer}" does not exist in mapConfig.layers.`, id, "map.layer");
      }
    }

    if (map.icon != null) {
      validateIdValue(file, map.icon, id, "map.icon");

      if (!iconIds.has(map.icon)) {
        addWarning(file, `Map icon "${map.icon}" does not exist in mapConfig.icons.`, id, "map.icon");
      }
    }
  }
}

function validateMapConfig(mapConfig: unknown) {
  const file = DATA_FILES.mapConfig;

  if (!isPlainObject(mapConfig)) return;

  if (!isPlainObject(mapConfig.defaultMap)) {
    addError(file, `Missing or invalid defaultMap.`, "defaultMap");
  } else {
    validateIdValue(file, mapConfig.defaultMap.id, "defaultMap", "defaultMap.id");

    if (!mapConfig.defaultMap.title) {
      addError(file, `defaultMap is missing title.`, "defaultMap", "defaultMap.title");
    }

    if (!mapConfig.defaultMap.imageSrc) {
      addError(file, `defaultMap is missing imageSrc.`, "defaultMap", "defaultMap.imageSrc");
    }

    if (typeof mapConfig.defaultMap.width !== "number") {
      addError(file, `defaultMap.width must be a number.`, "defaultMap", "defaultMap.width");
    }

    if (typeof mapConfig.defaultMap.height !== "number") {
      addError(file, `defaultMap.height must be a number.`, "defaultMap", "defaultMap.height");
    }
  }

  validateNestedUniqueIds(file, "mapConfig", mapConfig.layers, "layers", true);
  validateNestedUniqueIds(file, "mapConfig", mapConfig.icons, "icons", true);
}

function validateStatblocks(statblocks: JsonRecord, characterIds: Set<string>) {
  const file = DATA_FILES.statblocks;

  for (const [id, statblock] of Object.entries(statblocks)) {
    if (!isPlainObject(statblock)) continue;

    if (!characterIds.has(id)) {
      addWarning(file, `Statblock "${id}" has no matching character in characters.json.`, id, "id");
    }

    if (Array.isArray(statblock.classes)) {
      statblock.classes.forEach((entry: unknown, index: number) => {
        if (!isPlainObject(entry)) return;

        if (!entry.name) {
          addError(file, `Class entry is missing name.`, id, `classes[${index}].name`);
        }

        if (typeof entry.level !== "number") {
          addError(file, `Class entry level must be a number.`, id, `classes[${index}].level`);
        }
      });
    }
  }
}

function detectQuestCycles(quests: JsonRecord) {
  const file = DATA_FILES.quests;

  for (const questId of Object.keys(quests)) {
    const visited = new Set<string>();
    let currentId: string | null | undefined = questId;

    while (currentId) {
      if (visited.has(currentId)) {
        addError(file, `Cycle detected in quest parent chain: ${Array.from(visited).join(" -> ")} -> ${currentId}`, questId, "parentQuestId");
        break;
      }

      visited.add(currentId);

      const currentQuest = quests[currentId];
      if (!isPlainObject(currentQuest)) break;

      currentId = currentQuest.parentQuestId;
    }
  }
}

function printResults() {
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  console.log("");
  console.log("🧪 Hallyura data validation");
  console.log("──────────────────────────");
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);
  console.log("");

  if (issues.length > 0) {
    for (const issue of issues) {
      const icon = issue.severity === "error" ? "❌" : "⚠️";
      const location = [issue.file, issue.entityId, issue.field].filter(Boolean).join(" > ");

      console.log(`${icon} ${location}`);
      console.log(`   ${issue.message}`);
      console.log("");
    }
  }

  if (errors.length > 0) {
    console.log("Validation failed. Fix critical errors before generating docs or exporting from CMS.");
    process.exit(1);
  }

  console.log("Validation passed. No critical errors found.");
}

function main() {
  const characters = validateRecordFile(DATA_FILES.characters, readJson(DATA_FILES.characters));
  const quests = validateRecordFile(DATA_FILES.quests, readJson(DATA_FILES.quests));
  const factions = validateRecordFile(DATA_FILES.factions, readJson(DATA_FILES.factions));
  const locations = validateRecordFile(DATA_FILES.locations, readJson(DATA_FILES.locations));
  const mapConfig = readJson(DATA_FILES.mapConfig);
  const statblocks = fileExists(DATA_FILES.statblocks)
    ? validateRecordFile(DATA_FILES.statblocks, readJson(DATA_FILES.statblocks, false))
    : {};

  validateMapConfig(mapConfig);

  const characterIds = collectIds(characters);
  const factionIds = collectIds(factions);
  const locationIds = collectIds(locations);

  validateCharacters(characters, factionIds, locationIds);
  validateQuests(quests, characterIds, factionIds, locationIds);
  validateFactions(factions, characterIds, locationIds);
  validateLocations(locations, mapConfig);
  validateStatblocks(statblocks, characterIds);
  detectQuestCycles(quests);

  printResults();
}

main();
