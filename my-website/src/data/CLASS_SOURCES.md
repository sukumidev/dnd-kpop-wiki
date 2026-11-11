# Clases y subclases: política editorial de fuentes (Hallyura)

## Reglas base

- **D&D 5.5e / Player's Handbook (2024)** es la referencia primaria de las doce clases base.
- **Eberron: Forge of the Artificer** es la referencia para el Artífice revisado y sus opciones 5.5e.
- Los datos breves de clase en `characterClasses.ts` son resúmenes originales; no sustituyen las reglas de los manuales.
- **`statblocks.json` es la fuente de verdad para clase, nivel y subclase de los personajes**, pero no representa automáticamente un catálogo de subclases aprobadas para publicación en la Wiki.
- Antes de registrar una subclase, comprobar nombre exacto, fuente, compatibilidad, aprobación para Hallyura y ruta MDX. Mantener `subclassIds` y `characterSubclasses` consistentes.

## Biblioteca de referencia indicada

| Fuente | Uso editorial |
| --- | --- |
| Player's Handbook (2024) | Reglas principales 5.5e de clases y subclases |
| D&D Beyond Basic Rules (2024) | Verificación pública de rasgos y opciones básicas |
| Eberron: Forge of the Artificer | Artífice revisado para 5.5e |
| Xanathar's Guide to Everything | Opciones 5e (2014); verificar adaptación antes de incorporarlas |
| Tasha's Cauldron of Everything | Opciones 5e (2014); verificar adaptación antes de incorporarlas |
| The Book of Many Things | Material complementario; revisar cada opción por separado |
| Forgotten Realms: Heroes of Faerûn | Material complementario posterior; revisar cada opción por separado |
| Arcana Unleashed | Verificar título, procedencia y compatibilidad de cada opción antes de citarla |
| Ghosts of Saltmarsh | Referencia de ambientación y aventura, no catálogo base de clases |
| Monster Manual (2024) | Referencia de criaturas, no fuente primaria de clases |
| Dungeon Master's Guide (2024) | Reglas y herramientas para DM, no fuente primaria de clases |
| Sage Advice & Errata | Aclaraciones y correcciones aplicables por edición |

## Pendiente para siguiente PR: subclases

El inventario actual en `statblocks.json` contiene nombres de subclases oficiales de distintas ediciones, variantes de nombres (por ejemplo `Evoker` frente a `School of Evocation`) y opciones aparentemente personalizadas, como `Vestige Patron` y `College of the Moon`. Se requiere una tabla de equivalencias revisada antes de crear rutas públicas; **no se debe normalizar ni reescribir el JSON de personajes automáticamente**.

Cada entrada aprobada debería incluir: identificador estable, clase padre, nombre en español/inglés, fuente concreta, edición o compatibilidad verificada y marca `isHomebrew` si corresponde. Evitar reproducir texto extenso protegido de los manuales.

## Referencias de consulta pública

- https://www.dndbeyond.com/sources/dnd/br-2024/character-classes
- https://www.dndbeyond.com/sources/dnd/efota
