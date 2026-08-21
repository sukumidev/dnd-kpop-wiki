# Convención de validaciones

Versión: v0.1  
Sprint: 0

## Propósito

Definir qué debe validar el CMS y qué deben revisar los scripts antes de generar documentos MDX o renderizar dashboards.

En Sprint 0 no es obligatorio programar todas las validaciones. Lo importante es dejar claro qué bloquea generación y qué solo genera advertencia.

## Severidades

### Error crítico

Bloquea generación, build o exportación.

Un error crítico significa que los datos no son seguros para consumir.

### Warning

No bloquea generación, pero debe mostrarse para limpieza futura.

Un warning significa que la entidad puede renderizarse con fallback, placeholder visual o información incompleta.

## Errores críticos

| Error | Motivo |
|---|---|
| JSON inválido | El archivo no puede leerse |
| Entidad sin `id` | No se puede relacionar |
| Entidad sin `title` | No se puede mostrar correctamente |
| ID duplicado dentro del mismo archivo | Rompe relaciones y rutas |
| Key raíz distinta al `id` interno | Causa inconsistencias en imports tipo `Record<string, Entity>` |
| ID con formato inválido | Rompe convención de rutas y relaciones |
| `character.factionId` inexistente | Relación rota |
| `character.regionId` inexistente | Relación rota |
| `quest.characterIds` con ID inexistente | Relación rota |
| `quest.factionIds` con ID inexistente | Relación rota |
| `quest.locationIds` con ID inexistente | Relación rota |
| `quest.regionIds` con ID inexistente | Relación rota |
| `quest.parentQuestId` inexistente | Árbol de quests roto |
| Ciclo en `parentQuestId` | Árbol imposible de renderizar |
| `location.map.visible: true` sin `x` o `y` | Pin imposible de renderizar |
| `location.map.x` o `location.map.y` fuera de 0-100 | Coordenada inválida |
| `location.map.layer` inexistente en `mapConfig.layers` | Capa inválida |
| `location.map.icon` inexistente en `mapConfig.icons` | Ícono inválido |
| `statblock.id` sin personaje correspondiente cuando se espera vínculo directo | Statblock huérfano |
| Campo removido usado en datos nuevos | Indica contrato desactualizado |

## Warnings

| Warning | Motivo |
|---|---|
| Personaje sin `imageSrc` | Puede usar placeholder visual |
| Personaje sin `summary` | Menos útil en cards |
| Personaje sin `tags` | Menos filtrable |
| Quest sin `summary` | Menos útil en dashboards |
| Quest sin `tags` | Menos filtrable |
| Quest sin `rewards` | Puede ser válido, pero revisar |
| Faction sin `imageSrc` | Puede usar placeholder |
| Faction sin `leaderCharacterId` | Puede ser colectivo o desconocido |
| Location sin `summary` | Menos útil en cards |
| Location visible sin `icon` | Puede usar ícono default |
| Documento sin tags | Menos útil para búsqueda |
| Link `docPath` inexistente | Docusaurus lo reportará si se usa |
| Referencia futura a entidad aún no creada | Puede aceptarse temporalmente si es intencional |
| `map.visible: false` con coordenadas | No bloquea, pero revisar intención |

## Validaciones por archivo

### `characters.json`

Validar:

- `id`
- `title`
- `group`
- `status`
- `dynamic`
- `polyamoryStatus`
- `factionId`
- `regionId`
- `locationIds`
- `questIds`
- `tags`
- ausencia de campos removidos:
  - `age`
  - `class`
  - `subclass`
  - `lvl`

### `quests.json`

Validar:

- `id`
- `title`
- `types`
- `status`
- `visibility`
- `parentQuestId`
- `characterIds`
- `factionIds`
- `regionIds`
- `locationIds`
- `sessionStartedId`
- `lastUpdatedSessionId`
- `tags`
- `objectives[].id`

### `factions.json`

Validar:

- `id`
- `title`
- `type`
- `status`
- `regionId`
- `baseLocationId`
- `leaderCharacterId`
- `allyFactionIds`
- `rivalFactionIds`
- `subunits[].id`
- `subunits[].leaderCharacterId`
- `subunits[].memberIds`

### `locations.json`

Validar:

- `id`
- `title`
- `type`
- `status`
- `regionId`
- `parentLocationId`
- `map.visible`
- `map.x`
- `map.y`
- `map.icon`
- `map.layer`

### `mapConfig.json`

Validar:

- `defaultMap.id`
- `defaultMap.title`
- `defaultMap.imageSrc`
- `defaultMap.width`
- `defaultMap.height`
- `layers[].id`
- `icons[].id`
- IDs únicos en `layers`
- IDs únicos en `icons`

### `sessions.json`

Validar:

- `id` y `number` únicos
- `title`
- `sessionDate` en formato ISO `YYYY-MM-DD`
- `locationIds` y sus referencias a `locations.json`
- `characterIds` y sus referencias a `characters.json`
- warnings no bloqueantes por fechas, lugares, personajes o imagen ausentes

## Comportamiento esperado de scripts

### Ante error crítico

El script debe:

1. Detener generación.
2. Mostrar el archivo afectado.
3. Mostrar la entidad afectada.
4. Mostrar el campo afectado.
5. Mostrar el ID faltante o inválido.
6. Salir con código de error.

Ejemplo:

```txt
ERROR: quests.json > mq-defeat-taeil > characterIds includes missing ID: nct-taeil
```

### Ante warning

El script debe:

1. Continuar generación.
2. Mostrar el warning.
3. Agrupar warnings por archivo.
4. Permitir limpieza posterior.

Ejemplo:

```txt
WARNING: characters.json > nct-mark has no tags
```

## Checklist manual antes de cerrar Sprint 0

- [ ] Los JSON principales viven en `src/data`.
- [ ] Los contratos TypeScript existen.
- [ ] La documentación de contratos existe.
- [ ] Las reglas base existen en `dev-docs/rules`.
- [ ] Los IDs están normalizados.
- [ ] Los tags están normalizados.
- [ ] Las relaciones principales usan IDs.
- [ ] La Wiki sigue leyendo `characters.json`.
- [ ] La Wiki sigue leyendo `quests.json`.
- [ ] Los campos removidos ya no son necesarios en componentes actuales.
