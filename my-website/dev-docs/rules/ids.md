# Convención de IDs

Versión: v0.1  
Sprint: 0

## Regla base

Todo objeto principal debe tener un `id` estable, único dentro de su tipo y escrito en lowercase kebab-case.

Aplica a:

- personajes
- quests
- facciones
- lugares/regiones
- mapas
- capas de mapa
- íconos de mapa
- documentos futuros
- objetos futuros

## Formato válido

```txt
lowercase-kebab-case
```

Ejemplos válidos:

```txt
pc-kiyori
svt-joshua
nct-mark
clan-del-sol-ardiente
neo-culturales-tecnologicos
mq-collect-cards
pq-minjae-personal-arc
neocity
hotou
hallyura-main
```

## Formato inválido

```txt
Kiyori Hoshizuki
Neo Academia
clan del sol ardiente
ReactTripuertos
neo_academia
mq Collect Cards
```

## Reglas

### 1. El ID no debe depender del título visible

El `title` puede cambiar para mejorar lore, gramática o presentación. El `id` debe permanecer estable.

```json
{
  "id": "clan-del-sol-ardiente",
  "title": "Clan del Sol Ardiente"
}
```

### 2. El ID debe ser único dentro de su entidad

Puede existir un `pc-minjae` en `characters.json` y un `pc-minjae` en otro contexto técnico futuro solo si pertenecen a entidades completamente distintas. Como regla práctica, evita reutilizar IDs entre entidades para reducir confusión.

### 3. El ID no debe incluir acentos

Usar:

```txt
proteccion
```

No usar:

```txt
protección
```

### 4. El ID no debe incluir emoji

Los emojis pueden vivir en `title`, `label`, `caption` o contenido narrativo, pero no en IDs.

### 5. El ID no debe cambiar después de publicado

Cambiar un ID puede romper:

- relaciones por ID
- rutas generadas por CMS
- links internos
- dashboards
- scripts generadores
- referencias futuras

## Rutas de documentos

El `docPath` de personajes no se guarda manualmente en `characters.json`.

Para personajes, el CMS debe generarlo con:

```txt
characters/[group]/[id]
```

Ejemplo:

```txt
characters/party/pc-kiyori
characters/npc/nct-mark
```

La Wiki puede usar la ruta generada, pero la generación pertenece al CMS/scripts, no al componente visual.

## Checklist de validación

- [ ] La entidad tiene `id`.
- [ ] El `id` está en lowercase.
- [ ] El `id` usa kebab-case.
- [ ] El `id` no contiene espacios.
- [ ] El `id` no contiene underscores.
- [ ] El `id` no contiene acentos.
- [ ] El `id` no contiene emojis.
- [ ] El `id` es único dentro del archivo.
- [ ] La key raíz coincide con el `id` interno cuando el JSON usa formato `Record<string, Entity>`.
