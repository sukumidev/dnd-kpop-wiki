# Convención de status y enums

Versión: v0.1  
Sprint: 0

## Regla base

Los valores técnicos deben guardarse en inglés.  
La UI puede traducirlos a español.

Ejemplo:

```json
{
  "status": "active"
}
```

La UI puede mostrar:

```txt
Activo
```

## CharacterStatus

Valores permitidos:

```ts
type CharacterStatus =
  | "active"
  | "inactive"
  | "dead"
  | "missing"
  | "unknown";
```

Labels sugeridos:

| Valor | Label UI |
|---|---|
| `active` | Activo |
| `inactive` | Inactivo |
| `dead` | Fallecido |
| `missing` | Desaparecido |
| `unknown` | Desconocido |

## CharacterGroup

Valores permitidos:

```ts
type CharacterGroup = "party" | "npc";
```

Uso:

| Valor | Uso |
|---|---|
| `party` | Personajes de la party |
| `npc` | Personajes no jugables, aliados, enemigos o secundarios |

## CharacterDynamic

Valores permitidos:

```ts
type CharacterDynamic =
  | "alpha"
  | "beta"
  | "omega"
  | "unknown"
  | "n/a";
```

Labels sugeridos:

| Valor | Label UI |
|---|---|
| `alpha` | Alfa |
| `beta` | Beta |
| `omega` | Omega |
| `unknown` | Desconocido |
| `n/a` | N/A |

## PolyamoryStatus

Valores permitidos:

```ts
type PolyamoryStatus =
  | "yes"
  | "no"
  | "discovering"
  | "unknown"
  | "n/a";
```

Labels sugeridos:

| Valor | Label UI |
|---|---|
| `yes` | Sí |
| `no` | No |
| `discovering` | Descubriendo |
| `unknown` | Desconocido |
| `n/a` | N/A |

## QuestStatus

Valores permitidos:

```ts
type QuestStatus =
  | "active"
  | "completed"
  | "failed"
  | "paused"
  | "hidden"
  | "unknown";
```

Labels sugeridos:

| Valor | Label UI |
|---|---|
| `active` | Activa |
| `completed` | Completada |
| `failed` | Fallida |
| `paused` | Pausada |
| `hidden` | Oculta |
| `unknown` | Desconocida |

## QuestVisibility

Valores permitidos:

```ts
type QuestVisibility =
  | "public"
  | "hidden"
  | "dm-only";
```

## QuestType

Valores permitidos iniciales:

```ts
type QuestType =
  | "main"
  | "side"
  | "personal"
  | "faction"
  | "event"
  | "exploration"
  | "investigation";
```

## FactionStatus

Valores permitidos:

```ts
type FactionStatus =
  | "active"
  | "inactive"
  | "destroyed"
  | "disbanded"
  | "hidden"
  | "unknown";
```

## LocationStatus

Valores permitidos:

```ts
type LocationStatus =
  | "active"
  | "destroyed"
  | "hidden"
  | "lost"
  | "unknown";
```

## ProgressMode

Valores permitidos:

```ts
type ProgressMode =
  | "manual"
  | "objectives";
```

## Decisiones de Sprint 0

### `age` no se guarda en `characters.json`

`dateOfBirth` es la fuente de verdad.  
La edad se calcula usando la fecha actual de campaña, con calendario gregoriano.

```json
{
  "dateOfBirth": "2000-10-05"
}
```

No usar:

```json
{
  "age": 25
}
```

### Clase y combate no viven en `characters.json`

Los campos `class`, `subclass` y `lvl` fueron removidos de `characters.json`.

La fuente de verdad para datos de combate es `statblocks.json`.

### Placeholders

No usar:

```txt
—
-
```

Usar:

```json
null
```

Omitir el campo también es válido si realmente no aplica.

## Checklist de validación

- [ ] Los valores técnicos están en inglés.
- [ ] No se usan labels visibles como valores técnicos.
- [ ] No se usa `—` ni `-` como placeholder.
- [ ] `age` no existe en `characters.json`.
- [ ] `class`, `subclass` y `lvl` no existen en `characters.json`.
- [ ] La UI traduce valores técnicos cuando sea necesario.
