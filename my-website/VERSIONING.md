# Versionamiento de Hallyura Wiki

> **Estado:** convención propuesta para adoptar a partir del primer release formal.
> **Versión inicial propuesta:** `v0.1.0` (todavía no etiquetada ni publicada).
> **Alcance:** repositorio [`sukumidev/dnd-kpop-wiki`](https://github.com/sukumidev/dnd-kpop-wiki), aplicación ubicada en `my-website/`.

## 1. Objetivo

Mantener versiones identificables y reproducibles de **Hallyura Wiki**, diferenciando los cambios de software de las actualizaciones narrativas de la campaña. Una versión publicada debe poder rastrearse hasta un commit, reproducirse y, si es necesario, recuperarse.

La Wiki es el sitio de consulta. **Hallyura Studio** es un proyecto independiente para editar y exportar sus datos. Los archivos JSON son la fuente de verdad de las entidades estructuradas, y el contenido MDX sigue siendo parte del sitio.

## 2. Versiones independientes

| Elemento | Ubicación | Qué se versiona | Convención |
| --- | --- | --- | --- |
| **Hallyura Wiki** | `sukumidev/dnd-kpop-wiki` · `my-website/` | UI, componentes, rutas, páginas, scripts y distribución del sitio | `vMAJOR.MINOR.PATCH` |
| **Hallyura Studio** | `sukumidev/hallyura-cms` · `hallyura-studio/` | CMS, formularios, validaciones y flujo de importación/exportación | `vMAJOR.MINOR.PATCH` propio |
| **Contratos de datos** | Documentación de schemas compartidos | Compatibilidad de estructuras JSON entre Wiki, Studio y scripts | Versión de schema independiente, cuando se formalice |
| **Lore y sesiones** | JSON y páginas de contenido | Cambios narrativos y editoriales | Historial de Git; no llevan SemVer propio |

**Regla:** un release de Studio no obliga a publicar un release de la Wiki, ni viceversa. Un cambio del schema debe documentar qué lectores y exportadores siguen siendo compatibles. No se añadirá un campo de versión a la raíz de los JSON existentes sin una migración acordada.

## 3. Semantic Versioning

Se adopta **SemVer** con formato `MAJOR.MINOR.PATCH`:

| Incremento | Cuándo corresponde | Ejemplo |
| --- | --- | --- |
| **MAJOR** | A partir de `1.0.0`, cambios incompatibles en interfaces o contratos públicos: rutas sin compatibilidad, eliminación de campos requeridos o rediseño incompatible de la fuente de datos | `1.4.2` → `2.0.0` |
| **MINOR** | Nueva funcionalidad visible y compatible: mapa interactivo, nuevo módulo, filtros o nuevas vistas | `0.1.0` → `0.2.0` |
| **PATCH** | Correcciones y mejoras compatibles: bug de navegación, enlace roto, ajuste responsive o corrección editorial publicada | `0.2.0` → `0.2.1` |

### Regla especial antes de `1.0.0`

Las versiones `0.x.y` indican que el producto todavía está evolucionando y **no garantizan una API estable**. Para este proyecto:

- Una nueva funcionalidad relevante incrementa **MINOR**: `0.1.0` → `0.2.0`.
- Un cambio incompatible *antes de `1.0.0`* también incrementa **MINOR**, se señala como **BREAKING CHANGE** y exige notas de migración. No se sube a `1.0.0` automáticamente por un breaking change.
- Una corrección compatible incrementa **PATCH**: `0.2.0` → `0.2.1`.
- Al incrementar MAJOR o MINOR, PATCH vuelve a `0`.
- `1.0.0` se reservará para una primera línea estable, tras cumplir los criterios de la sección 11.

**Importante:** la versión la determina el impacto observable, no el tamaño del PR, el número de sprint ni el esfuerzo de implementación.

## 4. ¿Qué pasa con el lore?

Un commit que añade un NPC, actualiza una sesión, corrige una biografía o amplía el trasfondo de una facción **no obliga por sí solo a subir la versión**.

- **Actualización editorial rutinaria:** se registra en Git y puede acumularse para las próximas notas de release.
- **Corrección puntual de contenido ya publicado:** puede incluirse en un PATCH cuando se decida publicar un release.
- **Módulo o experiencia narrativa nueva en la Wiki** (por ejemplo, una cronología interactiva): puede justificar un MINOR por la funcionalidad, no por la cantidad de lore incorporado.
- **Cambio estructural del contenido o sus relaciones:** evaluar compatibilidad de scripts, CMS, rutas, referencias y contratos antes del release.

El historial narrativo del mundo y la numeración de sesiones **son distintos** de la versión del software. **Nunca** incluir spoilers, nombres secretos ni revelaciones privadas en un changelog o release público. Los controles de visibilidad de datos siguen siendo obligatorios independientemente del versionamiento.

## 5. Convenciones de ramas y commits

Se conserva un flujo sencillo: ramas cortas → Pull Request → validaciones → merge a `main`. No se exige una rama `develop` permanente.

### Ramas sugeridas

```text
feat/map-interactive
fix/sidebar-overflow
content/session-21
content/character-biographies
data/faction-relations
docs/versioning-policy
chore/image-migration
```

### Commits

Se recomienda un estilo basado en **Conventional Commits**, sin hacerlo obligatorio para el MVP:

| Prefijo | Uso |
| --- | --- |
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `refactor:` | Reorganización interna sin cambio funcional observable |
| `perf:` | Mejora de rendimiento |
| `test:` | Pruebas |
| `docs:` | Documentación técnica o del proyecto |
| `style:` | Cambios de estilo/código sin cambio funcional |
| `chore:` | Dependencias, tooling y mantenimiento |
| `content:` | Lore, sesiones y textos editoriales |
| `data:` | JSON, integridad referencial y migraciones |

Ejemplos:

```text
feat(map): agregar capas interactivas
fix(characters): corregir orden del directorio
content(sessions): actualizar resumen de sesión 21
data(factions): normalizar relaciones por ID
docs: documentar estrategia de releases
```

Para un cambio incompatible, indicar `BREAKING CHANGE:` en el cuerpo del commit o en la descripción del PR; nunca depender únicamente del prefijo para clasificarlo.

## 6. Reglas para elegir un release

1. Revisar los PRs integrados desde la versión anterior.
2. Distinguir cambios funcionales, correcciones, cambios de contrato y actualizaciones de contenido.
3. Aplicar la regla de mayor impacto: **breaking > feature > fix**; antes de `1.0.0`, breaking y feature generan MINOR, y el primero debe documentarse explícitamente.
4. No modificar la versión por cada commit: **los incrementos ocurren al preparar un release**.
5. Si el cambio solo involucra contenido narrativo o documentación, puede permanecer en `main` hasta el siguiente release planificado.
6. Si se anuncia una actualización pública, su contenido y su tag deben corresponder al commit realmente publicado.

### Ejemplos

| Cambio | Decisión recomendada |
| --- | --- |
| Se agregan tres NPCs a `characters.json` | Commit `content:`; sin incremento obligatorio |
| Se corrige un enlace roto del directorio | PATCH, al publicar |
| Se añade un buscador avanzado | MINOR |
| Se introduce una nueva forma incompatible de relacionar facciones en `0.x` | MINOR + `BREAKING CHANGE` + guía de migración |
| Se reorganiza código interno sin cambio observable | No requiere release aislado |
| Se corrige un spoiler filtrado en el build público | Corrección prioritaria; nuevo PATCH al publicar |

## 7. Versiones preliminares

Se pueden usar sufijos SemVer durante pruebas de un release:

```text
v0.2.0-alpha.1
v0.2.0-beta.1
v0.2.0-rc.1
v0.2.0
```

Solo se crean si aportan valor real al proceso. El `rc` debe apuntar a un commit concreto; los cambios posteriores requieren otra candidata o el release definitivo, nunca mover silenciosamente un tag publicado.

## 8. Proceso manual de publicación

**Ubicación de los comandos:** ejecutar dentro de `my-website/`.

### 8.1 Preparación

- Confirmar que los cambios previstos están integrados en `main` y no hay archivos pendientes de commit.
- Elegir la siguiente versión con las reglas anteriores.
- Pasar los cambios correspondientes de la sección `Sin publicar` de `CHANGELOG.md` a una sección con número y fecha real (`AAAA-MM-DD`).
- Revisar especialmente los cambios de schemas, URLs, referencias, visibilidad y migraciones de imágenes.
- Actualizar la versión de `package.json` **y** `package-lock.json` sin crear el tag todavía:

```bash
cd my-website
npm version 0.1.0 --no-git-tag-version
```

> `0.1.0` es **un ejemplo del primer release**, no un comando para ejecutar en cada publicación. Sustituirlo por la versión elegida. Si ya tiene esa versión, no volver a ejecutar el comando.

### 8.2 Quality gates

Con Node.js `20.18.1` o posterior y dependencias instaladas mediante `npm ci`:

```bash
npm run typecheck
npm run validate:data
npm test
npm run build
npm run build:public
```

Además:

- Verificar que el build normal renderiza los módulos y rutas afectadas.
- Revisar las salidas del **build público** para evitar contenido restringido o spoilers.
- Comprobar que los cambios de `characters`, `factions`, `quests`, `locations`, `sessions`, `documents` y `statblocks` siguen siendo compatibles con sus consumidores, cuando dichos archivos hayan cambiado.
- Revisar enlaces, redirecciones, imágenes e índices afectados.
- Asegurar que los scripts de generación no dejaron modificaciones inesperadas en el árbol de trabajo.

**Cualquier falla bloqueante debe resolverse antes de publicar.** No etiquetar un commit distinto del que pasó validaciones.

### 8.3 Publicación

1. Crear y fusionar el PR de release con los archivos de versión y changelog.
2. En el commit final validado de `main`, crear el tag Git **`vX.Y.Z`** (por ejemplo, `v0.1.0`).
3. Publicar el GitHub Release correspondiente usando el resumen revisado de `CHANGELOG.md`.
4. Desplegar el artefacto de ese commit/tag, según el proceso de hosting disponible.
5. Verificar la versión realmente desplegada y registrar cualquier incidente.

Por ahora **los tags y releases son manuales**. No asumir que existe una Action de publicación o un despliegue automático. Si se automatiza después, conservar la misma política y evitar versiones generadas por cada merge.

## 9. Changelog y compatibilidad

- El changelog oficial de la Wiki es [`CHANGELOG.md`](./CHANGELOG.md).
- Se mantiene una sección **Sin publicar** para lo que todavía no tiene tag.
- Las entradas publicadas usan fecha real y número de release.
- Registrar únicamente cambios relevantes para quien mantiene o consulta la Wiki; evitar copiar mensajes de commit sin contexto.
- Categorías sugeridas: **Añadido**, **Modificado**, **Corregido**, **Eliminado**, **Seguridad**, **Contenido** y **Migraciones**. Omitir categorías vacías.
- Un cambio incompatible siempre debe explicar impacto, acción requerida y componentes afectados.
- Si un release necesita una migración de datos, crear backup, describir pasos, validar los resultados y mantener un camino de recuperación.

### Contratos compartidos con Studio

Los schemas se versionarán de forma separada **cuando se implemente formalmente esa capacidad**; no se debe interpretar la versión de `package.json` como versión del schema.

Antes de aceptar un cambio de contrato:

1. Identificar productores (Studio, scripts) y consumidores (Wiki, scripts).
2. Verificar que los registros existentes pueden seguir leyéndose.
3. Documentar cualquier campo renombrado, eliminado o requerido.
4. Preparar la migración y comprobar que importar → editar → exportar no pierde datos legacy.
5. Coordinar releases de ambos repositorios si la compatibilidad lo requiere.

## 10. Convención de GitHub Release Notes

Las **Release Notes** resumen una versión publicada para quienes consultan o mantienen la Wiki. Se distinguen del [`CHANGELOG.md`](./CHANGELOG.md): el changelog es el historial acumulativo y las notas de release presentan las novedades principales de **un tag concreto** en lenguaje claro.

### Título y nomenclatura

Usar **`Hallyura Wiki vX.Y.Z — Release Name`**. El nombre es un subtítulo temático breve, preferentemente en inglés; el contenido de las notas se redacta en español. Ejemplos *ilustrativos* (no releases publicados):

- `Hallyura Wiki v0.1.0 — Foundations`
- `Hallyura Wiki v0.2.0 — Interactive Maps`
- `Hallyura Wiki v0.2.1 — Navigation Fixes`

El tag en Git siempre es **`vX.Y.Z`**; el nombre temático corresponde al título visible del GitHub Release, no al tag.

### Estructura de las notas

Usar [`.github/RELEASE_TEMPLATE.md`](../.github/RELEASE_TEMPLATE.md) como plantilla editorial:

1. **✦ Resumen**: 2–4 frases sobre el propósito de la versión y su impacto.
2. **✨ Añadido**: nuevas capacidades visibles.
3. **🔄 Modificado**: mejoras o cambios de comportamiento.
4. **🐛 Corregido**: errores relevantes resueltos.
5. **⚡ Rendimiento**: optimizaciones verificadas, si aplica.
6. **📚 Contenido**: actualizaciones de lore **solo públicas y libres de spoilers**.
7. **🗑️ Eliminado**: funciones retiradas, si aplica.
8. **🔒 Seguridad**: correcciones publicables sin revelar datos sensibles, si aplica.
9. **⚠️ Compatibilidad y migraciones**: incompatibilidades, componentes afectados y pasos concretos; si no hay migraciones, declararlo expresamente.
10. **🧪 Validación**: únicamente resultados de pruebas y builds **realmente ejecutados**.
11. **🔗 Referencias**: changelog, PRs y comparación entre tags cuando exista.

**Omitir categorías vacías**; las secciones de resumen, compatibilidad, validación y referencias se mantienen siempre. No repetir cada commit: redactar en términos del resultado para la persona usuaria. Cuando sea útil, añadir enlaces a PRs `#123` y comparar con el tag anterior.

### Reglas de publicación editorial

- Redactar notas **después** de confirmar el alcance del tag; deben corresponder exactamente al commit liberado.
- No inventar funciones, fechas, resultados de QA ni enlaces a versiones aún no publicadas.
- No exponer información `secret`, `hidden`, `dm-only`, detalles de sesiones pendientes ni identidades narrativas no reveladas.
- Un **BREAKING CHANGE** debe explicar qué deja de funcionar, a quién afecta y cómo migrar o volver atrás.
- Usar el mismo número y fecha en las Release Notes y en `CHANGELOG.md`.
- La plantilla `.github/RELEASE_TEMPLATE.md` es una **referencia para copiar en GitHub Releases**; GitHub no la carga automáticamente en el editor por existir en esa ruta. La automatización se definirá por separado si se necesita.

## 11. Criterios para `v1.0.0`

`v1.0.0` no está ligado a Sprint 8 ni a una fecha fija. Será la primera línea estable cuando:

- Los módulos principales utilizados por la campaña sean confiables y navegables.
- Los contratos compartidos con Studio estén documentados y tengan una estrategia de compatibilidad y migraciones.
- Los builds y pruebas críticas sean reproducibles.
- Existan controles comprobados para contenido público y spoilers.
- Se haya establecido el flujo de release, changelog y recuperación.

## 12. Recuperación de versiones

No borrar ni mover tags ya publicados. Ante un release defectuoso, volver a desplegar el último tag conocido como estable cuando el entorno lo permita. Si se requiere corregir código o datos, publicar un nuevo PATCH (o la versión que corresponda) y dejar registro del incidente y su solución.

---

**Resumen:** versión técnica por release, cambios narrativos mediante Git, contratos compartidos con compatibilidad explícita y publicación controlada mediante PR, pruebas, tag y changelog.