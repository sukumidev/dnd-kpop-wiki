# Convención de relaciones por ID

Versión: v0.1  
Sprint: 0

## Regla base

Las relaciones entre entidades deben hacerse por ID, no por nombre visible ni por ruta manual.

Esto permite que la Wiki, el CMS y los scripts conecten datos sin depender de textos que pueden cambiar.

## Entidades principales

- Character
- Quest
- Faction
- Location
- MapConfig

## Campos relacionales estándar

### Character

```ts
factionId?: string | null;
regionId?: string | null;
locationIds?: string[];
questIds?: string[];
```

Uso recomendado:

```json
{
  "id": "pc-kiyori",
  "factionId": "panes-del-destino",
  "regionId": "hotou",
  "locationIds": ["neocity"],
  "questIds": ["pq-kiyori-personal-arc"]
}
```

### Quest

```ts
characterIds?: string[];
factionIds?: string[];
regionIds?: string[];
locationIds?: string[];
sessionStartedId?: string | null;
lastUpdatedSessionId?: string | null;
parentQuestId?: string | null;
```

Uso recomendado:

```json
{
  "id": "mq-defeat-taeil",
  "characterIds": ["pc-kiyori", "nct-mark"],
  "factionIds": ["clan-del-sol-ardiente", "neo-culturales-tecnologicos"],
  "regionIds": ["sylmorien"],
  "parentQuestId": "mq-defeat-burning-sun"
}
```

### Faction

```ts
regionId?: string | null;
baseLocationId?: string | null;
leaderCharacterId?: string | null;
allyFactionIds?: string[];
rivalFactionIds?: string[];
```

Uso recomendado:

```json
{
  "id": "gremio-de-aventureros",
  "regionId": "hyberia",
  "baseLocationId": "sector-17",
  "leaderCharacterId": "svt-scoups",
  "allyFactionIds": ["panes-del-destino"],
  "rivalFactionIds": ["clan-del-sol-ardiente"]
}
```

### Location

```ts
regionId?: string | null;
parentLocationId?: string | null;
factionIds?: string[];
characterIds?: string[];
questIds?: string[];
```

Uso recomendado:

```json
{
  "id": "neocity",
  "regionId": "sylmorien",
  "factionIds": ["neo-culturales-tecnologicos"],
  "questIds": ["mq-defeat-burning-sun"]
}
```

## Decisiones de Sprint 0

### Usar `regionId`, no `kingdomId`

Se usa `regionId` para evitar forzar todos los lugares a pertenecer a un reino. Algunas entidades pueden ser regiones, reinos, ciudades, islas, zonas independientes o territorios no alineados.

Ejemplos:

```txt
sylmorien
hyberia
jeyperia
yggdrasil
hotou
naxai
```

### No duplicar miembros de facciones

La membresía general de una facción se obtiene leyendo `characters.json`:

```ts
character.factionId === faction.id
```

Por eso `factions.json` no debe usar `keyMembers` como fuente de verdad.

Excepción válida: `subunits`.

Las subunidades sí pueden tener `memberIds`, porque representan una estructura interna específica, no la membresía general de toda la facción.

```json
{
  "id": "unidad-de-defensa-y-vanguardia",
  "title": "Unidad de Defensa y Vanguardia",
  "leaderCharacterId": "svt-scoups",
  "memberIds": ["svt-scoups", "svt-mingyu", "svt-wonwoo", "svt-vernon"]
}
```

### No manejar `unresolvedDocs` en los contratos base

Si una ruta existe, Docusaurus la mostrará.  
Si no existe, Docusaurus avisará o mostrará error de página no encontrada.

No se crea un campo especial para `unresolvedDocs` en Sprint 0.

## Checklist de validación

- [ ] Las relaciones usan IDs.
- [ ] No se usa `label` como fuente de relación.
- [ ] No se usa `docPath` como fuente primaria de relación.
- [ ] Los IDs referenciados existen o se aceptan temporalmente como warning.
- [ ] Las facciones no duplican miembros generales.
- [ ] Las subunidades sí pueden listar `memberIds`.
- [ ] Las quests hijas usan `parentQuestId`.
- [ ] `childQuestIds` no se mantiene manualmente como fuente de verdad.
