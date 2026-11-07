# Registro de cambios — Hallyura Wiki

Registro de los cambios relevantes de **Hallyura Wiki**. Este archivo sigue el enfoque de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y las convenciones descritas en [`VERSIONING.md`](./VERSIONING.md).

**Estado del candidato (2026-11-07):** `package.json` y `package-lock.json` con versión `0.1.0` ya están fusionados a `main` mediante PR #35. La fecha objetivo para formalizar el release es **2026-11-07**; la publicación de GitHub Release y el tag siguen pendientes de verificación.

> **Nota de seguridad narrativa:** este changelog puede consultarse públicamente. No añadir spoilers, identidades ocultas, secretos de la DM ni detalles de sesiones aún no revelados.

## [Sin publicar]

Cambios acumulados que todavía **no** se han asignado a un tag publicado.

### Añadido

- Convención de versiones, compatibilidad y publicación documentada en `VERSIONING.md`.
- Archivo `CHANGELOG.md` para registrar releases y actualizaciones relevantes de la Wiki.
- Convención editorial de GitHub Release Notes y plantilla manual `.github/RELEASE_TEMPLATE.md`.

<!-- Añadir aquí nuevos cambios a medida que se fusionan PRs. Omitir categorías vacías. -->

---

## Preparación de `v0.1.0` — fecha objetivo: 2026-11-07 (sin GitHub Release)

Esta sección es un **inventario de referencia de capacidades ya presentes en el repositorio**, no una reconstrucción de cuándo se desarrolló cada una ni una afirmación de que estén todas terminadas o desplegadas. Al publicar el primer release, revisar los puntos, trasladar los confirmados a una sección `## [0.1.0] - AAAA-MM-DD` y dejar el resto en `Sin publicar` o fuera del alcance de la versión.

### Base existente por verificar para el release inicial

- Aplicación de documentación de **Hallyura Wiki** basada en Docusaurus y React, con configuración principal en `my-website/`.
- Fuentes de datos estructuradas para personajes, facciones, quests, lugares, sesiones, documentos y statblocks en `src/data/`.
- Scripts de generación de páginas y contenido para personajes, facciones y documentos.
- Herramientas de validación de datos, typecheck, pruebas y compilación del sitio.
- Herramientas de migración y comprobación de rutas de imágenes WebP.
- Flujo diferenciado de build público, sujeto a verificación antes de publicar para evitar exponer contenido reservado.

### Pendiente antes de publicar `v0.1.0`

- Alcance propuesto y notas completas: [`dev-docs/releases/v0.1.0.md`](./dev-docs/releases/v0.1.0.md), actualizado el **2026-11-07** (GitHub Release aún pendiente).
- Confirmar el alcance exacto que incluirá el primer release.
- **Completado en PR #35:** versión sincronizada a `0.1.0` en `my-website/package.json` y `my-website/package-lock.json`.
- Ejecutar los quality gates descritos en `VERSIONING.md` y comprobar sus resultados.
- Registrar la fecha real y un resumen definitivo de lo efectivamente publicado.
- Crear el tag `v0.1.0` y el GitHub Release **solo después** de completar las verificaciones.

---

## Convenciones para futuras entradas

Al publicar una versión, utilizar el siguiente formato, sustituyendo los ejemplos por cambios realmente incluidos y la fecha por la fecha de publicación:

```markdown
## [0.2.0] - AAAA-MM-DD

### Añadido
- Nueva función visible para quienes consultan la Wiki.

### Modificado
- Comportamiento actualizado de un módulo existente.

### Corregido
- Error de navegación o visualización resuelto.

### Contenido
- Actualizaciones narrativas públicas agrupadas, sin spoilers.

### Migraciones
- Cambio de datos o rutas y pasos necesarios, si aplica.
```

Las categorías **Eliminado** y **Seguridad** se usan cuando correspondan. Un cambio incompatible se marca como **BREAKING CHANGE** con su impacto y pasos de migración. No se crea una entrada fechada hasta publicar realmente la versión.