# HS-019 — Relaciones entre entidades

Versión: v0.1  
Sprint: 0  
Área: Shared Data / CMS / Wiki

## Objetivo

Relacionar personajes, quests, facciones y lugares mediante IDs para que la Wiki, el CMS y los scripts puedan conectar información sin depender de nombres visibles.

## Decisión principal

Las relaciones se hacen por ID.

No se deben usar nombres visibles como fuente de relación.

Correcto:

```json
{
  "characterIds": ["pc-kiyori", "nct-mark"],
  "factionIds": ["neo-culturales-tecnologicos"],
  "regionIds": ["sylmorien"]
}
```

Incorrecto:

```json
{
  "characters": ["Kiyori", "Mark"],
  "factions": ["Neo Academia"],
  "realm": "Sylmorien"
}
```

## Campos relacionales estándar

### Character

| Campo | Tipo | Descripción |
|---|---|---|
| `factionId` | `string \| null` | Facción principal del personaje |
| `regionId` | `string \| null` | Región de origen o asociación principal |
| `locationIds` | `string[]` | Lugares relacionados |
| `questIds` | `string[]` | Quests relacionadas |

### Quest

| Campo | Tipo | Descripción |
|---|---|---|
| `characterIds` | `string[]` | Personajes relacionados con la quest |
| `factionIds` | `string[]` | Facciones relacionadas |
| `regionIds` | `string[]` | Regiones relacionadas |
| `locationIds` | `string[]` | Lugares específicos relacionados |
| `parentQuestId` | `string \| null` | Quest padre para construir árbol |

### Faction

| Campo | Tipo | Descripción |
|---|---|---|
| `regionId` | `string \| null` | Región principal de la facción |
| `baseLocationId` | `string \| null` | Base principal |
| `leaderCharacterId` | `string \| null` | Líder |
| `allyFactionIds` | `string[]` | Facciones aliadas |
| `rivalFactionIds` | `string[]` | Facciones rivales |
| `subunits[].leaderCharacterId` | `string \| null` | Líder de subunidad |
| `subunits[].memberIds` | `string[]` | Miembros de subunidad |

### Location

| Campo | Tipo | Descripción |
|---|---|---|
| `regionId` | `string \| null` | Región contenedora |
| `parentLocationId` | `string \| null` | Lugar padre |
| `factionIds` | `string[]` | Facciones asociadas |
| `characterIds` | `string[]` | Personajes asociados |
| `questIds` | `string[]` | Quests asociadas |

## Decisiones de Sprint 0

### `regionId` sobre `kingdomId`

Se usa `regionId` para no forzar todos los territorios a pertenecer a un reino.

Esto permite representar:

- reinos
- regiones
- islas
- ciudades-estado
- zonas independientes
- planos o lugares especiales

### Miembros de facción

La membresía general de facción se resuelve desde `characters.json`.

```ts
character.factionId === faction.id
```

Por eso `factions.json` no debe tener `keyMembers` como fuente de verdad.

Las subunidades sí pueden tener `memberIds`, porque representan organización interna específica.

### Árbol de quests

El árbol de quests se resuelve desde `parentQuestId`.

No se mantiene `childQuestIds` manualmente como source of truth.

```ts
quest.parentQuestId === parent.id
```

## Helper recomendado

Se agrega:

```txt
src/data/relationships.ts
```

Este archivo centraliza la resolución de relaciones para evitar repetir lógica en componentes.

Funciones principales:

```ts
getCharacterById(id)
getQuestById(id)
getFactionById(id)
getLocationById(id)

getCharactersByFactionId(factionId)
getQuestsByCharacterId(characterId)
getQuestsByFactionId(factionId)
getQuestsByRegionId(regionId)
getLocationsByFactionId(factionId)

getQuestChildren(questId)
getRootQuests()

getFactionMembers(factionId)
getFactionLeader(faction)
getFactionBase(faction)
getFactionRegion(faction)

getCharacterRelations(characterId)
getQuestRelations(questId)
getFactionRelations(factionId)
getLocationRelations(locationId)
```

## Ejemplos

### Relación de personaje con facción y región

```json
{
  "id": "pc-kiyori",
  "factionId": "panes-del-destino",
  "regionId": "hotou",
  "locationIds": ["neocity"],
  "questIds": ["pq-kiyori-personal-arc"]
}
```

### Relación de quest con personajes y facciones

```json
{
  "id": "mq-defeat-taeil",
  "characterIds": ["pc-kiyori", "nct-mark"],
  "factionIds": ["clan-del-sol-ardiente", "neo-culturales-tecnologicos"],
  "regionIds": ["sylmorien"],
  "parentQuestId": "mq-defeat-burning-sun"
}
```

### Relación de facción con líder y base

```json
{
  "id": "gremio-de-aventureros",
  "leaderCharacterId": "svt-scoups",
  "regionId": "hyberia",
  "baseLocationId": "sector-17"
}
```

### Relación de lugar con facciones y quests

```json
{
  "id": "neocity",
  "regionId": "sylmorien",
  "factionIds": ["neo-culturales-tecnologicos"],
  "questIds": ["mq-defeat-burning-sun"]
}
```

## Definition of Done

- Las relaciones principales usan IDs.
- Los campos relacionales estándar están documentados.
- Los ejemplos por entidad existen.
- La lógica de resolución no depende de labels visibles.
- La membresía de facciones se obtiene desde `characters.json`.
- El árbol de quests se obtiene desde `parentQuestId`.
- Existe helper reusable para componentes.
