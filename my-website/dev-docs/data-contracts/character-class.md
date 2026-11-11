# Clases y subclases

El registro tipado vive en `src/data/characterClasses.ts`. El orden de `characterClasses` determina el orden del directorio y del sidebar. Los IDs son kebab-case estables; las subclases se relacionan mediante `subclassIds` en su clase y `classId` en su propio registro.

Para incorporar una subclase aprobada para Hallyura:

1. Añadir su registro a `characterSubclasses` y su ID a `subclassIds` de la clase correspondiente.
2. Crear `docs/mechanics/classes/<classId>/<subclassId>.mdx` con `title`, `hide_title: true` y el componente `CharacterSubclassPage` importado de `@site/src/components/classes/CharacterSubclassPage`.
3. Pasar `classId` y `subclassId` al componente. La ruta resultante será `/mechanics/classes/<classId>/<subclassId>`.
4. Mantener la subclase fuera de `sidebars.ts`; el enlace aparecerá solo en la ficha de su clase.

Los campos mecánicos, la descripción, la imagen y la fuente son opcionales. Las características por nivel pueden añadirse como contenido hijo de `CharacterClassPage` o `CharacterSubclassPage` cuando exista texto autorizado.

## Personajes de una clase

`src/data/classCharacters.ts` deriva esta relación de `statblocks.json`. La clase se resuelve por nombre o ID exacto después de normalizar mayúsculas, acentos y espacios. El `id` del statblock debe coincidir exactamente con un registro de `characters.json` que tenga ficha (`hasProfile !== false`). No se infieren relaciones por nombre del personaje.

Cada entrada de `classes` aporta el nivel de esa clase. Si hay varios statblocks para el mismo personaje, se muestra una sola tarjeta con el mayor nivel **registrado explícitamente para esa clase**. La relación no se guarda en los modelos de clases ni modifica los statblocks.

La subclase se lee del campo `subclass` de esa misma entrada de clase. Al resolver varios statblocks, la tarjeta conserva la subclase de la entrada elegida para el nivel mostrado; si esa entrada no la registra, se omite. La variante de `CharacterGrid` para estas páginas muestra el nombre completo, nivel y subclase sin cambiar las tarjetas de otros directorios.
