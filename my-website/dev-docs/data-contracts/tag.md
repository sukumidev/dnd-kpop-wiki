# Tag Contract

Versión: v0.1  
Sprint: 0  
Historia: US-037 — Etiquetar contenido desde CMS

## Decisión

Los tags son entidades administradas por el CMS.

El contenido no debe guardar strings libres en `tags`.  
Debe guardar referencias por ID en `tagIds`.

## Archivos

```txt
src/data/tags.json
src/data/tags.ts
```

## Tipo

```ts
type Tag = {
  id: string;
  title: string;
  category: TagCategory;
  status: TagStatus;
  description?: string | null;
  color?: string | null;
  aliases?: string[];
};
```

## Campos requeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | ID lowercase kebab-case |
| `title` | `string` | Nombre visible |
| `category` | `TagCategory` | Categoría del tag |
| `status` | `TagStatus` | Estado del tag |

## Categorías iniciales

```ts
type TagCategory =
  | "region"
  | "faction"
  | "arc"
  | "theme"
  | "species"
  | "magic"
  | "narrative"
  | "character"
  | "lore"
  | "other";
```

## Estados

```ts
type TagStatus = "active" | "inactive" | "deprecated";
```

## Uso en entidades

Las entidades principales deben usar:

```ts
tagIds?: string[];
```

Aplica a:

- Character
- Quest
- Faction
- Location
- futuros documentos generados por CMS

## Ejemplo

```json
{
  "sol-ardiente": {
    "id": "sol-ardiente",
    "title": "Sol Ardiente",
    "category": "faction",
    "status": "active",
    "description": "Contenido relacionado con el Clan del Sol Ardiente."
  }
}
```

## Ejemplo en quest

```json
{
  "id": "mq-defeat-burning-sun",
  "tagIds": ["sol-ardiente", "guerra", "radiancia-disenada"]
}
```

## Reglas

1. Los tags se crean desde el CMS.
2. Los tags se asignan desde el CMS.
3. `tagIds` debe apuntar a IDs existentes en `tags.json`.
4. Los tags no reemplazan relaciones por ID.
5. No usar tags para representar personajes, facciones, quests o lugares si existe un campo relacional más específico.
6. `tags` queda como campo legacy y debe migrarse a `tagIds`.
