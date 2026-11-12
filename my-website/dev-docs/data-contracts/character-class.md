# Clases y subclases

El registro de las **14 clases** vive en `src/data/characterClasses.ts`. El catálogo de las **119 subclases** vive en `src/data/characterSubclasses.json`. Los IDs son estables en kebab-case. Los `subclassIds` se derivan del catálogo, sin mantener una segunda lista manual.

## Una página MDX por clase, con TOC nativo de Docusaurus

Cada clase tiene una sola página en `docs/mechanics/classes/<classId>.mdx`. **No crear archivos MDX individuales por subclase ni construir un índice TSX paralelo.** Los encabezados MDX reales alimentan el índice derecho nativo del tema Docusaurus.

Para incluir o modificar una subclase:

1. Añadir o actualizar su registro en `src/data/characterSubclasses.json` con `id`, `classId`, `name`, `source`, `contentCategory` y alias históricos cuando corresponda.
2. Editar **solo** el MDX de la clase padre `docs/mechanics/classes/<classId>.mdx`. Agregar el encabezado de nivel tres con su ID estable, seguido del componente que muestra los datos. Usar sintaxis MDX de comentario: `### Nombre {/* #subclass-id */}`.
3. Mantener `toc_min_heading_level: 2` y `toc_max_heading_level: 3` en el frontmatter y no utilizar `hide_table_of_contents: true`. Las secciones de nivel dos son Información de clase, Subclases y Personajes de esta clase.
4. Verificar `npm test`, `npm run typecheck` y `npm run build`. El test de clases valida que cada subclase esté representada por un encabezado MDX y contenido, en el orden del catálogo.

Ejemplo:

```mdx
## Subclases {/* #class-subclasses */}

### Diviner {/* #subclass-diviner */}

<ClassSubclass classId="mago" subclassId="diviner" />
```

`getCharacterSubclassHref(classId, subclassId)` genera `/mechanics/classes/<classId>#subclass-<subclassId>`. Las rutas antiguas a MDX de subclases se redirigen a sus anclas actuales para preservar los bookmarks.

Los componentes de `src/components/classes/CharacterClassPage.tsx` insertan el contenido sin crear encabezados extra que no aparecerían en el TOC. Las características mecánicas por nivel podrán añadirse como resúmenes propios a `features` cuando estén verificadas.

## Personajes de una clase

`src/data/classCharacters.ts` deriva esta relación de `statblocks.json`. La clase se resuelve por nombre o ID exacto después de normalizar mayúsculas, acentos y espacios. El `id` del statblock debe coincidir exactamente con un registro de `characters.json` que tenga ficha (`hasProfile !== false`). No se infieren relaciones por nombre del personaje.

Cada entrada de `classes` aporta el nivel y la subclase de esa clase, incluso en multiclass. Si hay varios statblocks para el mismo personaje, se muestra una sola tarjeta con el mayor nivel **registrado explícitamente para esa clase**. La relación no se guarda en los modelos de clases ni modifica los statblocks.
