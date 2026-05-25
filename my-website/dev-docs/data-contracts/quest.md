# Quest Data Contract v0.1

## Propósito

El contrato `Quest` define misiones principales, personales, de facción, secundarias o de evento para la Wiki de Hallyura.

`quests.json` debe permitir renderizar dashboards, árboles de quests y listas filtrables sin depender de nombres visibles.

## Fuente de verdad

Archivo oficial:

```txt
src/data/quests.json
```

Contrato TypeScript:

```txt
src/data/quests.ts
```

## Decisiones del Sprint 0

- `id` usa lowercase kebab-case y debe ser único dentro de `quests.json`.
- `parentQuestId` es la fuente de verdad para el árbol de quests.
- `childQuestIds` no debe mantenerse manualmente como fuente principal.
- Los hijos se calculan en TypeScript/UI a partir de `parentQuestId`.
- Las relaciones usan IDs: `characterIds`, `factionIds`, `regionIds`, `locationIds`, `sessionIds`.
- `sessionStarted` y `lastUpdatedSession` migran a `sessionStartedId` y `lastUpdatedSessionId`.
- Los tags deben usar lowercase kebab-case.
- Los placeholders `-` y `—` deben migrar a `null`.
- Los links legacy con `label/docPath` pueden mantenerse solo para referencias narrativas externas como `questGiver`.

## Campos requeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | ID estable de la quest. |
| `title` | `string` | Nombre visible. |
| `types` | `QuestType[]` | Categorías de la quest. |
| `status` | `QuestStatus` | Estado técnico. |
| `summary` | `string` | Resumen corto. |

## Campos opcionales

| Campo | Tipo | Descripción |
|---|---|---|
| `subtitle` | `string \| null` | Subtítulo visible. |
| `visibility` | `QuestVisibility` | Visibilidad en Wiki/CMS. |
| `priority` | `QuestPriority` | Prioridad funcional/narrativa. |
| `description` | `string \| null` | Descripción larga. |
| `parentQuestId` | `string \| null` | Quest padre. |
| `progress` | `QuestProgress` | Progreso manual/por objetivos/por hijos. |
| `objectives` | `QuestObjective[]` | Objetivos internos. |
| `questGiver` | `QuestLink \| null` | Link narrativo a quien entrega la quest. |
| `characterIds` | `string[]` | Personajes relacionados. |
| `factionIds` | `string[]` | Facciones relacionadas. |
| `regionIds` | `string[]` | Regiones relacionadas. |
| `locationIds` | `string[]` | Lugares concretos relacionados. |
| `sessionIds` | `string[]` | Sesiones relacionadas. |
| `sessionStartedId` | `string \| null` | ID de sesión donde inició. |
| `lastUpdatedSessionId` | `string \| null` | ID de sesión de última actualización. |
| `rewards` | `string[]` | Recompensas narrativas o mecánicas. |
| `tags` | `string[]` | Tags auxiliares. |
| `imageSrc` | `string \| null` | Imagen opcional. |
| `accent` | `string \| null` | Color/acento visual. |
| `isRepeatable` | `boolean` | Si puede repetirse. |
| `failedConditions` | `string[]` | Condiciones de fallo. |
| `notes` | `string \| null` | Notas internas o visibles según UI. |
| `sortOrder` | `number` | Orden manual. |

## Enums

```ts
export type QuestStatus = "locked" | "active" | "completed" | "failed" | "paused";
export type QuestType = "main" | "side" | "faction" | "personal" | "event";
export type QuestVisibility = "public" | "hidden" | "secret" | "dm-only";
export type QuestPriority = "low" | "medium" | "high" | "critical";
```

## Tipos auxiliares

```ts
export type QuestProgress = {
  mode: "manual" | "objectives" | "children";
  current?: number;
  goal?: number;
  percent?: number;
};

export type QuestObjective = {
  id: string;
  label: string;
  done: boolean;
  failed?: boolean;
  weight?: number;
  optional?: boolean;
  notes?: string | null;
};

export type QuestLink = {
  label: string | null;
  docPath: string | null;
};
```

## Relaciones

| Campo | Apunta a | Regla |
|---|---|---|
| `parentQuestId` | `quests.json[id]` | Define jerarquía. |
| `characterIds` | `characters.json[id]` | Personajes relacionados. |
| `factionIds` | `factions.json[id]` | Facciones relacionadas. |
| `regionIds` | `locations.json[id]` | Regiones amplias relacionadas. |
| `locationIds` | `locations.json[id]` | Lugares concretos relacionados. |
| `sessionIds` | futura fuente de sesiones | Sesiones relacionadas. |
| `sessionStartedId` | futura fuente de sesiones | Inicio de quest. |
| `lastUpdatedSessionId` | futura fuente de sesiones | Última actualización. |

## Campos deprecados

Estos campos no deben agregarse a nuevas quests:

```txt
sessionStarted
lastUpdatedSession
factions
characters
locations
sessions
childQuestIds como fuente manual
```

## Ejemplo mínimo válido

```json
{
  "id": "mq-defeat-taeil",
  "parentQuestId": "mq-defeat-burning-sun",
  "title": "Derrotar a Taeil",
  "subtitle": "Ex Neo Académico corrupto",
  "types": ["main"],
  "status": "active",
  "visibility": "public",
  "summary": "La party debe detener a Taeil, antiguo miembro de la Neo Academia convertido en pieza clave del avance del Clan del Sol Ardiente.",
  "description": "Taeil posee conocimiento robado, ambición peligrosa y vínculos con los planes más crueles del Clan del Sol Ardiente.",
  "progress": {
    "mode": "manual",
    "current": 80,
    "goal": 100
  },
  "factionIds": ["clan-del-sol-ardiente", "neo-culturales-tecnologicos"],
  "characterIds": ["taeil"],
  "regionIds": ["sylmorien"],
  "sessionStartedId": "11-5",
  "lastUpdatedSessionId": "11-5",
  "rewards": ["Eliminar a un enemigo clave del Sol Ardiente"],
  "tags": ["taeil", "neo-academia", "sol-ardiente", "jefe-enemigo"],
  "accent": "red",
  "isRepeatable": false,
  "notes": "Subquest centrada en una figura clave del arco enemigo.",
  "sortOrder": 21
}
```

## Notas para el árbol de quests

Para obtener quests raíz:

```ts
quest.parentQuestId == null
```

Para obtener hijos:

```ts
quests.filter((quest) => quest.parentQuestId === parentId)
```

Esto evita duplicar `childQuestIds` manualmente.
