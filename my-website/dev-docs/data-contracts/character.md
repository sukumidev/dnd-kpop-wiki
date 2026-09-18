# Character Data Contract v0.1

## Propósito

El contrato `Character` define los datos biográficos, narrativos y visuales de un personaje de la Wiki de Hallyura.

Las fuentes de personajes no deben almacenar información de combate. Los datos de clase, subclase, nivel, estadísticas, resistencias y habilidades viven en `statblocks.json`.

## Fuente de verdad

Registro oficial consumido por la aplicación:

```txt
src/data/characters.ts
```

Fuentes de datos durante la migración:

```txt
src/data/characters.json       # fuente legacy
src/data/characters/*.json     # fuentes migradas por facción
```

`characters.ts` combina todas las fuentes en un único registro `characters` y una única lista `characterList`. Las fuentes por facción se aplican después de la fuente legacy, por lo que una entrada migrada reemplaza a su versión legacy por `id` sin duplicarse en el directorio.

## Decisiones del Sprint 0

- `id` usa lowercase kebab-case y debe ser único dentro del registro unificado de personajes.
- `group` se normaliza a `party` o `npc`.
- `misc` queda deprecado.
- `regionId` reemplaza `kingdomId` y `realmId`.
- `dateOfBirth` es la fuente de verdad para calcular edad.
- `age` no debe guardarse manualmente.
- `class`, `subclass` y `lvl` no pertenecen a las fuentes biográficas de personajes.
- `polyamoryStatus` se normaliza como enum técnico.
- Los valores técnicos van en inglés; la UI puede traducirlos a español.
- Los placeholders `-` y `—` deben migrar a `null`.
- El `docPath` del personaje no se guarda aquí. El CMS debe generarlo como `characters/[group]/[id]`.
- Los links internos dentro de `bonds`, `hometown`, `currentLocation`, `firstAppearance` y `lastSeen` pueden conservar `docPath` como fallback navegable.
- La UI, los índices, los scripts de generación y los validadores deben consumir el registro unificado en lugar de importar una fuente JSON concreta.

## Campos requeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | ID estable del personaje. |
| `title` | `string` | Nombre visible. |
| `group` | `"party" \| "npc"` | Grupo de navegación. |
| `status` | `CharacterStatus` | Estado técnico del personaje. |

## Campos opcionales

| Campo | Tipo | Descripción |
|---|---|---|
| `subtitle` | `string \| null` | Subtítulo visible del personaje. |
| `imageSrc` | `string \| null` | Imagen principal. |
| `images` | `CharacterImage[]` | Galería/carrusel visual. |
| `role` | `string \| null` | Rol visible en la Wiki. |
| `occupation` | `string[]` | Ocupaciones o cargos narrativos. |
| `dateOfBirth` | `string \| null` | Fecha de nacimiento en calendario gregoriano. |
| `zodiac` | `string \| null` | Signo zodiacal visible. |
| `mbti` | `string \| null` | MBTI visible. |
| `race` | `string \| null` | Raza/especie narrativa. |
| `dynamic` | `CharacterDynamic` | Dinámica A/B/O técnica. |
| `orientation` | `string \| null` | Orientación visible. |
| `romanticSituation` | `string \| null` | Situación romántica visible. |
| `polyamoryStatus` | `PolyamoryStatus` | Estado técnico de poliamor. |
| `factionId` | `string \| null` | Facción principal. |
| `regionId` | `string \| null` | Región asociada. |
| `hometown` | `CharacterLocationLink \| null` | Lugar de origen. |
| `currentLocation` | `CharacterLocationLink \| null` | Ubicación actual. |
| `firstAppearance` | `CharacterSessionLink \| null` | Primera aparición. |
| `lastSeen` | `CharacterSessionLink \| null` | Última aparición. |
| `bonds` | `CharacterBond[]` | Links a vínculos importantes. |
| `destinyCard` | `string \| null` | Carta del Destino visible, si aplica. |
| `tags` | `string[]` | Tags auxiliares. |
| `summary` | `string \| null` | Resumen corto para cards/listas. |
| `sortOrder` | `number` | Orden manual. |

## Enums

```ts
export type CharacterGroup = "party" | "npc";

export type CharacterStatus =
  | "active"
  | "inactive"
  | "dead"
  | "missing"
  | "unknown";

export type CharacterDynamic = "alpha" | "beta" | "omega" | "unknown" | null;

export type PolyamoryStatus = "yes" | "no" | "discovering" | "unknown" | null;
```

## Tipos auxiliares

```ts
export type CharacterImage = {
  src: string;
  caption?: string | null;
};

export type CharacterLocationLink = {
  label: string | null;
  locationId: string | null;
  docPath: string | null;
};

export type CharacterSessionLink = {
  label: string | null;
  sessionId: string | null;
  docPath: string | null;
};

export type CharacterBond = {
  label: string | null;
  characterId: string | null;
  docPath: string | null;
};
```

## Relaciones

| Campo | Apunta a | Regla |
|---|---|---|
| `factionId` | `factions.json[id]` | Relación principal de facción. |
| `regionId` | `locations.json[id]` | Región amplia, no necesariamente reino. |
| `hometown.locationId` | `locations.json[id]` | Lugar de origen si existe. |
| `currentLocation.locationId` | `locations.json[id]` | Ubicación actual si existe. |
| `bonds[].characterId` | `characters[id]` | Vínculo a otro personaje del registro unificado. |
| `firstAppearance.sessionId` | futura fuente de sesiones | Debe usar ID técnico. |
| `lastSeen.sessionId` | futura fuente de sesiones | Debe usar ID técnico. |

## Campos deprecados

Estos campos no deben agregarse a nuevos personajes:

```txt
age
class
subclass
lvl
kingdomId
realm
realmRef
poli
romantic_situation
actual_location
faction
```

## Ejemplo mínimo válido

```json
{
  "id": "pc-kiyori",
  "title": "Kiyori Hoshizuki",
  "subtitle": "La Heroína Erudita",
  "imageSrc": "/img/characters/party/kiyori.png",
  "group": "party",
  "role": "Player",
  "occupation": ["Estudiante de la Neo Academia"],
  "status": "active",
  "dateOfBirth": "2000-10-05",
  "race": "Tiefling",
  "dynamic": "omega",
  "orientation": "Pan",
  "romanticSituation": "Sin compromisos",
  "polyamoryStatus": "yes",
  "factionId": "panes-del-destino",
  "regionId": "hotou",
  "currentLocation": {
    "label": "Neocity",
    "locationId": "neocity",
    "docPath": "world/locations/neocity"
  },
  "bonds": [
    {
      "label": "Mark",
      "characterId": "nct-mark",
      "docPath": "characters/npc/nct-mark"
    }
  ],
  "destinyCard": null,
  "images": [
    {
      "src": "/img/characters/party/kiyori-neovibe.png",
      "caption": "Kiyori cambio de look"
    }
  ],
  "tags": ["kiyori", "neo-academia", "tiefling"]
}
```

## Notas para el CMS

El CMS debe generar automáticamente la ruta documental del personaje usando:

```txt
characters/[group]/[id]
```

Ejemplo:

```txt
characters/party/pc-kiyori
characters/npc/nct-mark
```

La UI de la Wiki no debe recalcular ni almacenar manualmente esta ruta para la entidad principal.
