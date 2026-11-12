# Integración de apariencia de biblioteca: CMS → Wiki

Auditoría: 11 de noviembre de 2026. La Wiki consume `metadata.library.appearance` del JSON exportado por el CMS; no guarda SVG arbitrario ni modifica contenido narrativo.

## Base seleccionada

| Repositorio/rama | Estado auditado |
| --- | --- |
| Wiki `main` (`0e0131a`) y `release` (`19e96f8`) | No contienen `BookSpine` ni `Bookshelf`; mantienen el índice clásico. |
| Wiki `codex/biblioteca-hallyura` (`4c9a46b`) | Introduce la Biblioteca ilustrada y el lector refactorizado. |
| Wiki `codex/archive-objects-20261111` (`9940a8a`, PR #44) | Base de esta feature: seis variantes físicas, materiales y desgaste. |
| CMS `main` (`b738325`) | Sin las features recientes de marcos y símbolos vectoriales. |
| CMS `codex/ornamental-frames` (`6f90e6a`, PR #7) | Seis marcos seleccionables sobre el campo existente `ornament`. |
| CMS `codex/vector-ornaments` (`0410014`, PR #8) | Catálogo definitivo de 44 símbolos, incluidos doce SVG con IDs persistidos. |

Los componentes de lectura y las rutas generadas continúan usando `DocumentReaderPage`, tanto para MDX compilado como para Markdown heredado. `src/data/documents.ts` conserva los contratos narrativos; `scripts/validate-data.ts` llama al validador opcional de `metadata.library`; `scripts/generate-document-pages.ts` no necesita cambios.

## Contrato efectivo

- `BookAppearance` agrega opcionalmente `displayMode`, `material` y `wear`; conserva `spineTitle`, `color`, `accentColor`, `symbol`, `ornament`, `height`, `thickness`, `texture` y `spineImage`.
- Los modos son `book`, `letter`, `newspaper`, `dossier`, `notice` y `scroll`. Sin `displayMode` se conserva el libro anterior.
- Los acabados son `leather`, `cloth`, `parchment`, `newsprint`, `canvas`, `aged-paper`; los desgastes son `new`, `used`, `ancient`.
- Los marcos nuevos del CMS son `none`, `circle`, `diamond`, `laurel-frame`, `arcane`, `filigree-frame`. `filigree`, `stars` y `laurel` siguen siendo valores clásicos de `ornament` y conservan su tratamiento visual.
- Los 32 símbolos anteriores se exportan como glifos. Los doce SVG nuevos se exportan como los IDs de `archiveVectorAssets.json`. `symbol` y `ornament` son independientes.
- La resolución usa los valores explícitos exportados por CMS antes que cualquier valor predeterminado. Un modo sin apariencia completa mantiene los colores, dimensiones y símbolo deterministas del libro base, como en el preview del CMS. El material incompatible vuelve al predeterminado de su modo; `wear` ausente usa `new`.
- `discoveredAt`, `discoveredRealmId` y `hidden` siguen gobernando agrupación y presencia en estantes. El acceso al lector se determina aparte por `status` y `visibility`.

Los valores desconocidos reciben un fallback visual estable. El JSON original no se reescribe y los campos adicionales de `metadata` permanecen intactos.

## Recursos SVG y build público

Los doce archivos de `static/img/symbols/` reproducen la geometría de `ornamentalVectorIcons.tsx` del CMS en `0410014` (mismo `viewBox="0 0 64 64"`, paths, círculos y reglas de trazo). Son SVG autónomos, sin scripts, fuentes ni referencias externas. `OrnamentalSymbol` usa el manifest de rutas aprobadas y una máscara CSS; el color procede de `accentColor` sin depender de herencia de `currentColor` a través de `<img>`.

`scripts/build-public.mjs` mantiene la denegación general de `static/`. Sólo añade las doce rutas versionadas del manifest a su lista de recursos requeridos, comprueba que existen y falla si falta uno o si el manifest contiene rutas inválidas o duplicadas. La política de documentos no públicos y la auditoría de filtraciones no cambian.

El dominio público confirmado es `https://hallyura-wiki.pages.dev`. Con `SITE_URL=https://hallyura-wiki.pages.dev`, `npm run build:public` terminó correctamente: copió exactamente los doce SVG aprobados y omitió las ocho rutas de documentos no públicos. También se corrigió la comparación de rutas de `fs.cp` en Windows, que podía dejar pasar `characters.backup.json` al staging al recibir rutas con prefijo `\\?\`; la invocación anidada de npm usa el CLI de Node para evitar `spawnSync npm.cmd EINVAL`. Ambas correcciones conservan la política de copia selectiva y el control de filtraciones.

## Comparación visual

| Comprobación | CMS | Wiki |
| --- | --- | --- |
| Variantes | Preview de seis objetos | Mismas seis siluetas en las repisas existentes |
| Símbolos nuevos | SVG inline `64×64` | Misma geometría en SVG local con máscara de color |
| Marcos | SVG inline separado del símbolo | Misma geometría y campo `ornament` independiente |
| Legado | Glifos y acabados anteriores | Conservados sin migración |
| Navegación | Vista previa del editor | Enlace público, tooltip y foco de la Biblioteca |

Referencia del CMS: [símbolos con marcos](https://github.com/sukumidev/hallyura-cms/blob/codex/vector-ornaments/hallyura-studio/artifacts/screenshots/vector-ornaments-combinations.png). Capturas de la Wiki: [escritorio](screenshots/library-cms-desktop.png) y [móvil](screenshots/library-cms-mobile.png). La vista de la Wiki utiliza documentos temporales de prueba durante la captura; `documents.json` no se modificó.

La Wiki conserva su iluminación y paleta de la Biblioteca. En papel y pergamino aplica una ligera mezcla del color personalizado al acabado; el preview del CMS mantiene pigmentos de papel fijos. Esa diferencia es intencional para que el color exportado sea visible sin perder legibilidad.
