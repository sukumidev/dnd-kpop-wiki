# Location Data Contract v0.1

## Propósito

El contrato `Location` define regiones, ciudades, puertos, distritos, aldeas, bases, mazmorras y lugares importantes de Hallyura.

También define la configuración necesaria para que un lugar pueda aparecer como pin en el mapa interactivo.

## Fuente de verdad

Archivo oficial:

```txt
src/data/locations.json
```

Contrato TypeScript:

```txt
src/data/locations.ts
```

## Decisiones del Sprint 0

- `id` usa lowercase kebab-case y debe ser único dentro de `locations.json`.
- `regionId` puede apuntar a una región amplia dentro de `locations.json`.
- Las regiones grandes también son `Location` con `type: "region"`.
- `parentLocationId` permite jerarquía territorial.
- No todos los lugares deben aparecer en mapa.
- `map.visible: false` permite lugares sin coordenadas.
- Si `map.visible` es `true`, `x` y `y` deben existir y estar entre `0` y `100`.
- Las coordenadas del mapa se manejan como porcentaje, no pixeles.
- Los placeholders `-` y `—` deben migrar a `null`.

## Campos requeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | ID estable del lugar. |
| `title` | `string` | Nombre visible. |
| `type` | `LocationType` | Tipo de lugar. |
| `status` | `LocationStatus` | Estado técnico. |

## Campos opcionales

| Campo | Tipo | Descripción |
|---|---|---|
| `subtitle` | `string \| null` | Subtítulo visible. |
| `visibility` | `LocationVisibility` | Visibilidad. |
| `summary` | `string \| null` | Resumen corto. |
| `description` | `string \| null` | Descripción larga. |
| `regionId` | `string \| null` | Región amplia asociada. |
| `parentLocationId` | `string \| null` | Lugar padre. |
| `factionIds` | `string[]` | Facciones relacionadas. |
| `characterIds` | `string[]` | Personajes relacionados. |
| `questIds` | `string[]` | Quests relacionadas. |
| `map` | `LocationMapPin` | Configuración de pin. |
| `tags` | `string[]` | Tags auxiliares. |
| `imageSrc` | `string \| null` | Imagen principal. |
| `accent` | `string \| null` | Color/acento visual. |
| `sortOrder` | `number` | Orden manual. |

## Enums

```ts
export type LocationStatus = "active" | "inactive" | "destroyed" | "hidden" | "unknown";

export type LocationVisibility = "public" | "hidden" | "secret" | "dm-only";

export type LocationType =
  | "region"
  | "city"
  | "town"
  | "village"
  | "district"
  | "port"
  | "academy"
  | "base"
  | "dungeon"
  | "landmark"
  | "plane"
  | "other";
```

## Tipo de mapa

```ts
export type LocationMapPin = {
  visible: boolean;
  x: number | null;
  y: number | null;
  icon?: string | null;
  layer?: string | null;
  label?: string | null;
};
```

## Relaciones

| Campo | Apunta a | Regla |
|---|---|---|
| `regionId` | `locations.json[id]` | Región amplia. |
| `parentLocationId` | `locations.json[id]` | Jerarquía territorial. |
| `factionIds` | `factions.json[id]` | Facciones relacionadas. |
| `characterIds` | `characters.json[id]` | Personajes relacionados. |
| `questIds` | `quests.json[id]` | Quests relacionadas. |
| `map.icon` | `mapConfig.icons[id]` | Ícono válido. |
| `map.layer` | `mapConfig.layers[id]` | Capa válida. |

## Ejemplo mínimo válido sin mapa visible

```json
{
  "id": "hyberia",
  "title": "Hyberia",
  "subtitle": null,
  "type": "region",
  "status": "active",
  "visibility": "public",
  "summary": null,
  "description": null,
  "regionId": null,
  "parentLocationId": null,
  "factionIds": [],
  "characterIds": [],
  "questIds": [],
  "map": {
    "visible": false,
    "x": null,
    "y": null,
    "icon": "region",
    "layer": "regions",
    "label": "Hyberia"
  },
  "tags": ["hyberia", "region"],
  "imageSrc": null,
  "accent": "blue",
  "sortOrder": 2
}
```

## Ejemplo válido con pin visible

```json
{
  "id": "hotou",
  "title": "Hotou",
  "type": "region",
  "status": "active",
  "visibility": "public",
  "regionId": null,
  "parentLocationId": "jeyperia",
  "map": {
    "visible": true,
    "x": 67.5,
    "y": 38.2,
    "icon": "region",
    "layer": "regions",
    "label": "Hotou"
  },
  "tags": ["hotou", "jeyperia", "region"]
}
```

## Validaciones recomendadas

- `map.visible: true` sin `x` o `y` es error crítico.
- `x` y `y` deben estar entre `0` y `100`.
- `map.icon` debe existir en `mapConfig.icons`.
- `map.layer` debe existir en `mapConfig.layers`.
- `parentLocationId` no debe apuntar a sí mismo.
