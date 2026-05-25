# Task: Add shared relationship helpers for data contracts v0.1

## Context

The Hallyura Wiki has migrated its shared data contracts to v0.1.

Characters, quests, factions and locations now relate to each other through IDs.

We need a centralized helper layer so UI components do not manually duplicate relationship logic.

## Goal

Add a new file:

```txt
src/data/relationships.ts
```

This file should expose helper functions for resolving relationships between:

- characters
- quests
- factions
- locations

## Requirements

Use existing data exports from:

```txt
src/data/characters.ts
src/data/quests.ts
src/data/factions.ts
src/data/locations.ts
```

Do not read legacy fields like:

```txt
faction.keyMembers
faction.leader
faction.realm
faction.base
quest.characters
quest.factions
```

Use the new ID fields:

```txt
character.factionId
character.regionId
character.locationIds
character.questIds

quest.characterIds
quest.factionIds
quest.regionIds
quest.locationIds
quest.parentQuestId

faction.leaderCharacterId
faction.baseLocationId
faction.regionId
faction.allyFactionIds
faction.rivalFactionIds
faction.subunits[].memberIds

location.regionId
location.parentLocationId
location.factionIds
location.characterIds
location.questIds
```

## Functions to add

```ts
getCharacterDocPath(character)
getCharacterById(id)
getQuestById(id)
getFactionById(id)
getLocationById(id)

getCharactersByFactionId(factionId)
getCharactersByRegionId(regionId)
getCharactersByLocationId(locationId)
getCharactersByQuestId(questId)

getQuestsByCharacterId(characterId)
getQuestsByFactionId(factionId)
getQuestsByRegionId(regionId)
getQuestsByLocationId(locationId)
getQuestParent(quest)
getQuestChildren(questId)
getRootQuests()

getFactionsByRegionId(regionId)
getFactionMembers(factionId)
getFactionLeader(faction)
getFactionBase(faction)
getFactionRegion(faction)
getFactionAllies(faction)
getFactionRivals(faction)

getLocationsByRegionId(regionId)
getLocationsByFactionId(factionId)
getLocationsByCharacterId(characterId)
getLocationsByQuestId(questId)
getLocationParent(location)
getLocationChildren(locationId)

getCharacterRelations(characterId)
getQuestRelations(questId)
getFactionRelations(factionId)
getLocationRelations(locationId)
getRelationshipWarnings()
```

## Character doc path

Do not store `docPath` manually in `characters.json`.

Generate it as:

```ts
`characters/${character.group}/${character.id}`
```

## Acceptance criteria

- `src/data/relationships.ts` exists.
- It imports from the contract files.
- It resolves relationships by ID.
- It does not rely on visible labels.
- It does not use `keyMembers` as faction membership source.
- Faction members are resolved from `character.factionId`.
- Quest children are resolved from `parentQuestId`.
- Missing relations do not crash helper functions.
- `npm run build` passes.
