# Clases y subclases aprobadas en Hallyura

## Autoridad de los datos

- **Catálogo permitido:** copia editorial versionada de la pestaña `Classes` en [Characters — Classes & Subclasses Pool](https://docs.google.com/spreadsheets/d/1VzbRtqUGG8FelHgZABurPsGXnJmQpq7hEctedMnP_L4/edit?gid=1013832248), almacenada en `characterSubclasses.json`.
- **Personajes, niveles y subclases equipadas:** `statblocks.json`. Nunca inferir una subclase equipada de las columnas «Personaje» del Google Sheet.
- **Versiones:** una ficha por subclase, usando la revisión más reciente identificada y conservando nombres históricos en `aliases`.
- **Clases permitidas:** las doce clases 2024, Artífice (Forge of the Artificer) y Blood Hunter (Critical Role, **terceros**).
- **Total:** 119 subclases canónicas. Se unificó Totem Warrior con Wild Heart y se añadió Path of the World Tree a petición de la DM.
- **No hay reproducción de habilidades por nivel** todavía: las fichas actuales son directorio, fuente y navegación; consulta los manuales originales para las reglas.

## Correspondencia de fuentes

| Código de la hoja | Fuente editorial |
| --- | --- |
| PHB | Player's Handbook (2024) |
| EFotA | Eberron: Forge of the Artificer (2025) |
| ER | **Desambiguado por subclase:** Arcana Unleashed (2026) o Forgotten Realms: Heroes of Faerûn (2025) |
| XGtE | Xanathar's Guide to Everything (2017) |
| TCoE | Tasha's Cauldron of Everything (2020) |
| SCAG | Sword Coast Adventurer's Guide (2015); cuando existe reedición en Xanathar, se usa la más reciente |
| CR | Opciones de Critical Role / material de terceros; la compatibilidad específica con 2024 deberá verificarse por separado |

La etiqueta `official` se reserva a publicaciones oficiales de Dungeons & Dragons; `partner` a material de terceros. El catálogo no afirma que las opciones antiguas hayan recibido una revisión mecánica 2024.

### Arcana Unleashed (2026)

Arcana Domain (Cleric); Arcane Archer (Fighter); Warrior of the Mystic Arts (Monk); Vestige Patron (Warlock); Conjurer, Enchanter, Necromancer y Transmuter (Wizard).

### Forgotten Realms: Heroes of Faerûn (2025)

College of the Moon (Bard); Knowledge Domain (Cleric); Banneret (Fighter); Oath of the Noble Genies (Paladin); Winter Walker (Ranger); Scion of the Three (Rogue); Spellfire Sorcery (Sorcerer); Bladesinger (Wizard).

## Resoluciones de canon

- Mark: Wizard 13 (Abjurer), Artificer 3 (Artillerist). La asignación de War Magic en la hoja es histórica.
- Jisung (NCT): Wild Magic Sorcery; no cambiar automáticamente a Spellfire.
- Kao: Druid 3 (Circle of Stars) / Bard 3 (College of the Moon).
- Taeil / Taevil: planificado como Transmuter, sin statblock creado.
- Jongho: el texto `Path of the Totem Warrior` del statblock sigue siendo válido como alias de `Path of the Wild Heart`.
- Kiyori, Imugi, Soobin y otros: conservar etiquetas históricas en sus statblocks; resolver su versión canónica mediante alias.

## Estructura del manual por clase y TOC nativo

Cada clase tiene **una única ruta MDX** en `docs/mechanics/classes/[classId].mdx`. No existe una página de contenido por subclase.

Los 14 documentos de clase incluyen encabezados MDX reales para que **el índice lateral derecho nativo de Docusaurus** muestre y navegue las secciones de la misma página. Se habilita mediante `toc_min_heading_level: 2` y `toc_max_heading_level: 3`, sin `hide_table_of_contents: true`.

Ejemplo de estructura en la ficha de Mago:

```mdx
<ClassHeader classId="mago" />

## Información de clase {/* #class-details */}

<ClassDetails classId="mago" />

## Subclases {/* #class-subclasses */}

### Diviner {/* #subclass-diviner */}

<ClassSubclass classId="mago" subclassId="diviner" />

## Personajes de esta clase {/* #class-characters */}

<ClassCharacters classId="mago" />
```

Los encabezados `##` y `###` **deben escribirse en MDX**; los encabezados renderizados dinámicamente por TSX no alimentan el TOC de Docusaurus. Los IDs explícitos mantienen enlaces estables, incluso si cambia el nombre visible.

El catálogo `characterSubclasses.json` continúa siendo la fuente de datos para las 119 subclases. Si se añade, quita o reordena una subclase, actualizar la **única ficha MDX de su clase** para que coincidan título, orden, ancla y componente. El test `character-classes.test.ts` detecta discrepancias.

Los componentes `ClassHeader`, `ClassDetails`, `ClassSubclass` y `ClassCharacters` presentan metadatos y estadísticas desde el modelo actual. La información por nivel se podrá completar con resúmenes originales en `features`; no se inventan textos de reglas.

Se conservan redirecciones de las rutas antiguas `/mechanics/classes/[classId]/[subclassId]` a `/mechanics/classes/[classId]#subclass-[subclassId]`.

La tarea `npm run clean:subclasses` elimina **solo** las páginas antiguas generadas cuyo contenido coincide exactamente con el template, sin borrar las páginas editadas manualmente. Se ejecuta antes de `npm start`, `npm test` y `npm run build`.

Referencia técnica: https://docusaurus.io/docs/markdown-features/toc

## Referencias de verificación

- [D&D Beyond — Cambios del Player's Handbook 2024](https://www.dndbeyond.com/posts/1810-updates-in-the-players-handbook-2024)
- [D&D Beyond — Arcana Unleashed](https://www.dndbeyond.com/sources/dnd/au)
- [D&D Beyond — Heroes of Faerûn, contenido de las ocho subclases](https://www.dndbeyond.com/forums/d-d-beyond-general/release-issues-support/231469-forgotten-realms-heroes-of-faerun-issues-and)
- [D&D Beyond — Eberron: Forge of the Artificer](https://www.dndbeyond.com/sources/dnd/efota)
