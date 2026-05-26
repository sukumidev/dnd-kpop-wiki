/**
 * relationships.ts
 *
 * HS-019 — Relacionar personajes, quests, facciones y lugares
 *
 * Centralized relationship helpers for the shared data contracts v0.1.
 *
 * Purpose:
 * - Keep relationship logic out of UI components.
 * - Resolve relationships by ID.
 * - Avoid using visible labels as the source of truth.
 * - Avoid duplicating faction membership in factions.json.
 */

import charactersJson from "./characters.json";
import questsJson from "./quests.json";
import factionsJson from "./factions.json";
import locationsJson from "./locations.json";
import type { Character, CharactersById } from "./characters";
import type { Quest, QuestsById } from "./quests";
import type { Faction, FactionsById } from "./factions";
import type { Location, LocationsById } from "./locations";

export type { Character } from "./characters";
export type { Quest, QuestMap } from "./quests";
export type { Faction, FactionSubunit } from "./factions";
export type { Location } from "./locations";

export const characters = charactersJson as CharactersById;
export const quests = questsJson as QuestsById;
export const factions = factionsJson as FactionsById;
export const locations = locationsJson as LocationsById;

export const characterList = Object.values(characters);

export const questList = Object.values(quests).sort((a, b) => {
  const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;

  if (aOrder !== bOrder) return aOrder - bOrder;
  return a.title.localeCompare(b.title);
});

export const factionList = Object.values(factions).sort((a, b) => {
  const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;

  if (aOrder !== bOrder) return aOrder - bOrder;
  return a.title.localeCompare(b.title);
});

export const locationList = Object.values(locations).sort((a, b) => {
  const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;

  if (aOrder !== bOrder) return aOrder - bOrder;
  return a.title.localeCompare(b.title);
});

export type EntityId = string;

export type RelationshipWarning = {
  sourceType: "character" | "quest" | "faction" | "location";
  sourceId: string;
  field: string;
  targetType: "character" | "quest" | "faction" | "location";
  targetId: string;
  message: string;
};

/**
 * Character doc paths are generated from the character contract.
 * Do not store this manually in characters.json.
 */
export function getCharacterDocPath(character: Pick<Character, "id" | "group">): string {
  return `characters/${character.group}/${character.id}`;
}

export function getCharacterById(id: EntityId | null | undefined): Character | undefined {
  if (!id) return undefined;
  return characters[id];
}

export function getQuestById(id: EntityId | null | undefined): Quest | undefined {
  if (!id) return undefined;
  return quests[id];
}

export function getFactionById(id: EntityId | null | undefined): Faction | undefined {
  if (!id) return undefined;
  return factions[id];
}

export function getLocationById(id: EntityId | null | undefined): Location | undefined {
  if (!id) return undefined;
  return locations[id];
}

export function getCharactersByFactionId(factionId: EntityId): Character[] {
  return characterList.filter((character) => character.factionId === factionId);
}

export function getCharactersByRegionId(regionId: EntityId): Character[] {
  return characterList.filter((character) => character.regionId === regionId);
}

export function getCharactersByLocationId(locationId: EntityId): Character[] {
  return characterList.filter((character) => character.locationIds?.includes(locationId));
}

export function getCharactersByQuestId(questId: EntityId): Character[] {
  return characterList.filter((character) => character.questIds?.includes(questId));
}

export function getQuestsByCharacterId(characterId: EntityId): Quest[] {
  return questList.filter((quest) => quest.characterIds?.includes(characterId));
}

export function getQuestsByFactionId(factionId: EntityId): Quest[] {
  return questList.filter((quest) => quest.factionIds?.includes(factionId));
}

export function getQuestsByRegionId(regionId: EntityId): Quest[] {
  return questList.filter((quest) => quest.regionIds?.includes(regionId));
}

export function getQuestsByLocationId(locationId: EntityId): Quest[] {
  return questList.filter((quest) => quest.locationIds?.includes(locationId));
}

export function getQuestParent(quest: Quest): Quest | undefined {
  return getQuestById(quest.parentQuestId);
}

export function getQuestChildren(questId: EntityId): Quest[] {
  return questList
    .filter((quest) => quest.parentQuestId === questId)
    .sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));
}

export function getRootQuests(): Quest[] {
  return questList
    .filter((quest) => !quest.parentQuestId)
    .sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));
}

export function getFactionsByRegionId(regionId: EntityId): Faction[] {
  return factionList.filter((faction) => faction.regionId === regionId);
}

export function getFactionMembers(factionId: EntityId): Character[] {
  return getCharactersByFactionId(factionId);
}

export function getFactionLeader(faction: Faction): Character | undefined {
  return getCharacterById(faction.leaderCharacterId);
}

export function getFactionBase(faction: Faction): Location | undefined {
  return getLocationById(faction.baseLocationId);
}

export function getFactionRegion(faction: Faction): Location | undefined {
  return getLocationById(faction.regionId);
}

export function getFactionAllies(faction: Faction): Faction[] {
  return (faction.allyFactionIds ?? [])
    .map(getFactionById)
    .filter(Boolean) as Faction[];
}

export function getFactionRivals(faction: Faction): Faction[] {
  return (faction.rivalFactionIds ?? [])
    .map(getFactionById)
    .filter(Boolean) as Faction[];
}

export function getLocationsByRegionId(regionId: EntityId): Location[] {
  return locationList.filter((location) => location.regionId === regionId);
}

export function getLocationsByFactionId(factionId: EntityId): Location[] {
  return locationList.filter((location) => location.factionIds?.includes(factionId));
}

export function getLocationsByCharacterId(characterId: EntityId): Location[] {
  return locationList.filter((location) => location.characterIds?.includes(characterId));
}

export function getLocationsByQuestId(questId: EntityId): Location[] {
  return locationList.filter((location) => location.questIds?.includes(questId));
}

export function getLocationParent(location: Location): Location | undefined {
  return getLocationById(location.parentLocationId);
}

export function getLocationChildren(locationId: EntityId): Location[] {
  return locationList
    .filter((location) => location.parentLocationId === locationId)
    .sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));
}

/**
 * Returns all entities directly related to a character.
 */
export function getCharacterRelations(characterId: EntityId) {
  const character = getCharacterById(characterId);

  if (!character) {
    return undefined;
  }

  return {
    character,
    faction: getFactionById(character.factionId),
    region: getLocationById(character.regionId),
    locations: (character.locationIds ?? [])
      .map(getLocationById)
      .filter(Boolean) as Location[],
    quests: (character.questIds ?? [])
      .map(getQuestById)
      .filter(Boolean) as Quest[],
  };
}

/**
 * Returns all entities directly related to a quest.
 */
export function getQuestRelations(questId: EntityId) {
  const quest = getQuestById(questId);

  if (!quest) {
    return undefined;
  }

  return {
    quest,
    parent: getQuestParent(quest),
    children: getQuestChildren(quest.id),
    characters: (quest.characterIds ?? [])
      .map(getCharacterById)
      .filter(Boolean) as Character[],
    factions: (quest.factionIds ?? [])
      .map(getFactionById)
      .filter(Boolean) as Faction[],
    regions: (quest.regionIds ?? [])
      .map(getLocationById)
      .filter(Boolean) as Location[],
    locations: (quest.locationIds ?? [])
      .map(getLocationById)
      .filter(Boolean) as Location[],
  };
}

/**
 * Returns all entities directly related to a faction.
 */
export function getFactionRelations(factionId: EntityId) {
  const faction = getFactionById(factionId);

  if (!faction) {
    return undefined;
  }

  return {
    faction,
    leader: getFactionLeader(faction),
    members: getFactionMembers(faction.id),
    base: getFactionBase(faction),
    region: getFactionRegion(faction),
    allies: getFactionAllies(faction),
    rivals: getFactionRivals(faction),
    quests: getQuestsByFactionId(faction.id),
    locations: getLocationsByFactionId(faction.id),
  };
}

/**
 * Returns all entities directly related to a location.
 */
export function getLocationRelations(locationId: EntityId) {
  const location = getLocationById(locationId);

  if (!location) {
    return undefined;
  }

  return {
    location,
    parent: getLocationParent(location),
    children: getLocationChildren(location.id),
    factions: (location.factionIds ?? [])
      .map(getFactionById)
      .filter(Boolean) as Faction[],
    characters: (location.characterIds ?? [])
      .map(getCharacterById)
      .filter(Boolean) as Character[],
    quests: (location.questIds ?? [])
      .map(getQuestById)
      .filter(Boolean) as Quest[],
  };
}

/**
 * Lightweight relationship validator.
 * This does not replace scripts/validate-data.ts.
 * It is useful for UI/debugging because it returns warnings instead of throwing.
 */
export function getRelationshipWarnings(): RelationshipWarning[] {
  const warnings: RelationshipWarning[] = [];

  for (const character of characterList) {
    if (character.factionId && !getFactionById(character.factionId)) {
      warnings.push({
        sourceType: "character",
        sourceId: character.id,
        field: "factionId",
        targetType: "faction",
        targetId: character.factionId,
        message: `Character references missing faction "${character.factionId}".`,
      });
    }

    if (character.regionId && !getLocationById(character.regionId)) {
      warnings.push({
        sourceType: "character",
        sourceId: character.id,
        field: "regionId",
        targetType: "location",
        targetId: character.regionId,
        message: `Character references missing region/location "${character.regionId}".`,
      });
    }

    for (const locationId of character.locationIds ?? []) {
      if (!getLocationById(locationId)) {
        warnings.push({
          sourceType: "character",
          sourceId: character.id,
          field: "locationIds",
          targetType: "location",
          targetId: locationId,
          message: `Character references missing location "${locationId}".`,
        });
      }
    }

    for (const questId of character.questIds ?? []) {
      if (!getQuestById(questId)) {
        warnings.push({
          sourceType: "character",
          sourceId: character.id,
          field: "questIds",
          targetType: "quest",
          targetId: questId,
          message: `Character references missing quest "${questId}".`,
        });
      }
    }
  }

  for (const quest of questList) {
    if (quest.parentQuestId && !getQuestById(quest.parentQuestId)) {
      warnings.push({
        sourceType: "quest",
        sourceId: quest.id,
        field: "parentQuestId",
        targetType: "quest",
        targetId: quest.parentQuestId,
        message: `Quest references missing parent quest "${quest.parentQuestId}".`,
      });
    }

    for (const characterId of quest.characterIds ?? []) {
      if (!getCharacterById(characterId)) {
        warnings.push({
          sourceType: "quest",
          sourceId: quest.id,
          field: "characterIds",
          targetType: "character",
          targetId: characterId,
          message: `Quest references missing character "${characterId}".`,
        });
      }
    }

    for (const factionId of quest.factionIds ?? []) {
      if (!getFactionById(factionId)) {
        warnings.push({
          sourceType: "quest",
          sourceId: quest.id,
          field: "factionIds",
          targetType: "faction",
          targetId: factionId,
          message: `Quest references missing faction "${factionId}".`,
        });
      }
    }

    for (const locationId of quest.locationIds ?? []) {
      if (!getLocationById(locationId)) {
        warnings.push({
          sourceType: "quest",
          sourceId: quest.id,
          field: "locationIds",
          targetType: "location",
          targetId: locationId,
          message: `Quest references missing location "${locationId}".`,
        });
      }
    }

    for (const regionId of quest.regionIds ?? []) {
      if (!getLocationById(regionId)) {
        warnings.push({
          sourceType: "quest",
          sourceId: quest.id,
          field: "regionIds",
          targetType: "location",
          targetId: regionId,
          message: `Quest references missing region/location "${regionId}".`,
        });
      }
    }
  }

  for (const faction of factionList) {
    if (faction.regionId && !getLocationById(faction.regionId)) {
      warnings.push({
        sourceType: "faction",
        sourceId: faction.id,
        field: "regionId",
        targetType: "location",
        targetId: faction.regionId,
        message: `Faction references missing region/location "${faction.regionId}".`,
      });
    }

    if (faction.leaderCharacterId && !getCharacterById(faction.leaderCharacterId)) {
      warnings.push({
        sourceType: "faction",
        sourceId: faction.id,
        field: "leaderCharacterId",
        targetType: "character",
        targetId: faction.leaderCharacterId,
        message: `Faction references missing leader "${faction.leaderCharacterId}".`,
      });
    }

    if (faction.baseLocationId && !getLocationById(faction.baseLocationId)) {
      warnings.push({
        sourceType: "faction",
        sourceId: faction.id,
        field: "baseLocationId",
        targetType: "location",
        targetId: faction.baseLocationId,
        message: `Faction references missing base location "${faction.baseLocationId}".`,
      });
    }

    for (const locationId of faction.locationIds ?? []) {
      if (!getLocationById(locationId)) {
        warnings.push({
          sourceType: "faction",
          sourceId: faction.id,
          field: "locationIds",
          targetType: "location",
          targetId: locationId,
          message: `Faction references missing location "${locationId}".`,
        });
      }
    }

    for (const allyId of faction.allyFactionIds ?? []) {
      if (!getFactionById(allyId)) {
        warnings.push({
          sourceType: "faction",
          sourceId: faction.id,
          field: "allyFactionIds",
          targetType: "faction",
          targetId: allyId,
          message: `Faction references missing ally faction "${allyId}".`,
        });
      }
    }

    for (const rivalId of faction.rivalFactionIds ?? []) {
      if (!getFactionById(rivalId)) {
        warnings.push({
          sourceType: "faction",
          sourceId: faction.id,
          field: "rivalFactionIds",
          targetType: "faction",
          targetId: rivalId,
          message: `Faction references missing rival faction "${rivalId}".`,
        });
      }
    }

    for (const subunit of faction.subunits ?? []) {
      if (subunit.leaderCharacterId && !getCharacterById(subunit.leaderCharacterId)) {
        warnings.push({
          sourceType: "faction",
          sourceId: faction.id,
          field: `subunits.${subunit.id}.leaderCharacterId`,
          targetType: "character",
          targetId: subunit.leaderCharacterId,
          message: `Faction subunit references missing leader "${subunit.leaderCharacterId}".`,
        });
      }

      for (const memberId of subunit.memberIds ?? []) {
        if (!getCharacterById(memberId)) {
          warnings.push({
            sourceType: "faction",
            sourceId: faction.id,
            field: `subunits.${subunit.id}.memberIds`,
            targetType: "character",
            targetId: memberId,
            message: `Faction subunit references missing member "${memberId}".`,
          });
        }
      }
    }
  }

  for (const location of locationList) {
    if (location.regionId && !getLocationById(location.regionId)) {
      warnings.push({
        sourceType: "location",
        sourceId: location.id,
        field: "regionId",
        targetType: "location",
        targetId: location.regionId,
        message: `Location references missing region/location "${location.regionId}".`,
      });
    }

    if (location.parentLocationId && !getLocationById(location.parentLocationId)) {
      warnings.push({
        sourceType: "location",
        sourceId: location.id,
        field: "parentLocationId",
        targetType: "location",
        targetId: location.parentLocationId,
        message: `Location references missing parent location "${location.parentLocationId}".`,
      });
    }

    for (const factionId of location.factionIds ?? []) {
      if (!getFactionById(factionId)) {
        warnings.push({
          sourceType: "location",
          sourceId: location.id,
          field: "factionIds",
          targetType: "faction",
          targetId: factionId,
          message: `Location references missing faction "${factionId}".`,
        });
      }
    }

    for (const characterId of location.characterIds ?? []) {
      if (!getCharacterById(characterId)) {
        warnings.push({
          sourceType: "location",
          sourceId: location.id,
          field: "characterIds",
          targetType: "character",
          targetId: characterId,
          message: `Location references missing character "${characterId}".`,
        });
      }
    }

    for (const questId of location.questIds ?? []) {
      if (!getQuestById(questId)) {
        warnings.push({
          sourceType: "location",
          sourceId: location.id,
          field: "questIds",
          targetType: "quest",
          targetId: questId,
          message: `Location references missing quest "${questId}".`,
        });
      }
    }
  }

  return warnings;
}
