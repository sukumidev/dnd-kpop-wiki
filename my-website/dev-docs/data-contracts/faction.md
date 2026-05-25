# Faction Data Contract v0.1

## Propósito

El contrato `Faction` define grupos, órdenes, clanes, gremios, academias, manadas, alianzas y facciones enemigas de Hallyura.

`factions.json` debe describir la identidad de la facción, sus relaciones, su base y sus subunidades. La membresía general no se duplica aquí: se obtiene desde `characters.json` usando `character.factionId`.

## Fuente de verdad

Archivo oficial:

```txt
src/data/factions.json
```

Contrato TypeScript:

```txt
src/data/factions.ts
```

## Decisiones del Sprint 0

- `id` usa lowercase kebab-case y debe ser único dentro de `factions.json`.
- `keyMembers` queda deprecado como fuente de verdad.
- Los miembros generales se calculan leyendo `characters.json` por `factionId`.
- Las `subunits` sí permanecen en `factions.json` porque representan estructura interna específica.
- `regionId` reemplaza `realm`/`realmRef`.
- `baseLocationId` reemplaza `base.doc` cuando el lugar exista en `locations.json`.
- Relaciones entre facciones usan `allyFactionIds` y `enemyFactionIds`.
- Relaciones especiales con personajes usan `allyCharacterIds` y `enemyCharacterIds`.
- Los placeholders `-` y `—` deben migrar a `null`.

## Campos requeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | ID estable de facción. |
| `title` | `string` | Nombre visible. |
| `status` | `FactionStatus` | Estado técnico. |

## Campos opcionales

| Campo | Tipo | Descripción |
|---|---|---|
| `subtitle` | `string \| null` | Subtítulo visible. |
| `type` | `FactionType \| string \| null` | Tipo de facción. |
| `visibility` | `FactionVisibility` | Visibilidad. |
| `summary` | `string \| null` | Resumen corto. |
| `description` | `string \| null` | Descripción larga. |
| `reputation` | `string \| null` | Reputación visible. |
| `goal` | `string \| null` | Objetivo principal. |
| `methods` | `string \| null` | Métodos característicos. |
| `regionId` | `string \| null` | Región asociada. |
| `baseLocationId` | `string \| null` | Base principal. |
| `baseLabel` | `string \| null` | Label fallback si no existe location. |
| `locationIds` | `string[]` | Lugares relacionados. |
| `leaderCharacterId` | `string \| null` | Líder principal. |
| `allyFactionIds` | `string[]` | Facciones aliadas. |
| `enemyFactionIds` | `string[]` | Facciones rivales/enemigas. |
| `allyCharacterIds` | `string[]` | Aliados individuales. |
| `enemyCharacterIds` | `string[]` | Rivales individuales. |
| `subunits` | `FactionSubunit[]` | Subunidades internas. |
| `tags` | `string[]` | Tags auxiliares. |
| `imageSrc` | `string \| null` | Imagen principal. |
| `imageCaption` | `string \| null` | Caption de imagen. |
| `accent` | `string \| null` | Color/acento visual. |
| `sortOrder` | `number` | Orden manual. |

## Enums

```ts
export type FactionStatus = "active" | "inactive" | "destroyed" | "unknown";

export type FactionType =
  | "party"
  | "guild"
  | "academy"
  | "order"
  | "clan"
  | "pack"
  | "pirates"
  | "kingdom"
  | "enemy"
  | "alliance"
  | "other";

export type FactionVisibility = "public" | "hidden" | "secret" | "dm-only";
```

## Tipos auxiliares

```ts
export type FactionSubunit = {
  id: string;
  title: string;
  role?: string | null;
  leaderCharacterId?: string | null;
  memberIds?: string[];
  bullets?: string[];
};
```

## Relaciones

| Campo | Apunta a | Regla |
|---|---|---|
| `regionId` | `locations.json[id]` | Región amplia. |
| `baseLocationId` | `locations.json[id]` | Base principal. |
| `locationIds` | `locations.json[id]` | Lugares relacionados. |
| `leaderCharacterId` | `characters.json[id]` | Líder. |
| `allyFactionIds` | `factions.json[id]` | Facciones aliadas. |
| `enemyFactionIds` | `factions.json[id]` | Facciones rivales/enemigas. |
| `allyCharacterIds` | `characters.json[id]` | Aliados individuales. |
| `enemyCharacterIds` | `characters.json[id]` | Rivales individuales. |
| `subunits[].leaderCharacterId` | `characters.json[id]` | Líder de subunidad. |
| `subunits[].memberIds` | `characters.json[id]` | Miembros de subunidad. |

## Campos deprecados

Estos campos no deben agregarse a nuevas facciones:

```txt
realm
realmRef
base
leader
keyMembers
allies
rivals
caption
```

## Ejemplo mínimo válido

```json
{
  "id": "gremio-de-aventureros",
  "title": "Gremio de Aventureros",
  "subtitle": "La Orden que mueve Hyberia",
  "type": "guild",
  "status": "active",
  "visibility": "public",
  "summary": "Gremio aliado que protege rutas, resuelve crisis locales y mantiene el balance de poder en Hyberia.",
  "reputation": "Respetados (y temidos cuando toca)",
  "goal": "Proteger rutas, resolver crisis locales y mantener el balance de poder en Hyberia.",
  "methods": "Contratos • diplomacia • misiones • fuerza cuando es necesario",
  "regionId": "hyberia",
  "baseLocationId": "sector-17",
  "baseLabel": "Sector 17",
  "leaderCharacterId": "svt-scoups",
  "allyFactionIds": ["panes-del-destino"],
  "enemyFactionIds": ["clan-del-sol-ardiente"],
  "subunits": [
    {
      "id": "unidad-de-defensa-y-vanguardia",
      "title": "🛡️ Unidad de Defensa y Vanguardia",
      "role": "Choque y mando táctico",
      "leaderCharacterId": "svt-scoups",
      "memberIds": ["svt-scoups", "svt-mingyu", "svt-wonwoo", "svt-vernon"],
      "bullets": ["Primera línea en asedios y escoltas del Gremio"]
    }
  ],
  "tags": ["gremio", "hyberia", "seventeen"],
  "imageSrc": "/img/factions/gremio-de-aventureros.png",
  "imageCaption": "Los Trece Soñadores",
  "accent": "green",
  "sortOrder": 10
}
```

## Notas para la UI

Para obtener miembros generales de una facción:

```ts
characters.filter((character) => character.factionId === faction.id)
```

No usar `keyMembers` como fuente de verdad.
