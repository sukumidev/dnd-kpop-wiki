# Migración de rutas de imágenes a WebP

El script `migrate-image-paths-to-webp.mjs` revisa rutas locales `/img/...` en `src/`, `docs/`, `static/data/`, `sidebars.ts` y `docusaurus.config.ts`.

## Ejecución

Trabajar desde la carpeta `my-website/`:

```bash
npm run images:paths:dry
npm run images:webp
npm run images:paths:write
npm run images:paths:check
npm run test:image-paths
npm run validate:data
npm run typecheck
npm run build
```

Como atajo, `npm run images:migrate` ejecuta la **conversión** y luego la **actualización de las rutas**. Se recomienda hacer primero el dry-run.

## Comportamiento

- El modo por defecto (`images:paths:dry`) no escribe archivos.
- Solo cambia las extensiones `.png`, `.jpg` y `.jpeg` de referencias **locales** cuando realmente existe una versión `.webp` del mismo nombre y directorio.
- Conserva la estructura y el formato de JSON, TS/TSX, MDX, Markdown y CSS sin serializarlos nuevamente.
- Admite nombres con espacios y acentos, así como espacios codificados con `%20`, query strings y fragmentos.
- No modifica URLs de servidores externos ni nombres de imágenes dentro de textos normales.
- Reporta las rutas cuyo archivo WebP falta; no las cambia ni inventa nombres. Se requiere resolverlas manualmente.
- El modo `--check` falla mientras queden rutas antiguas entre los archivos activos inspeccionados.
- Excluye backups `*.backup.json` y páginas archivadas bajo `docs/characters/misc`.

## Importante

La migración de rutas **no borra los archivos originales**, no los elimina del índice de Git ni purga el historial. No agregues reglas de `.gitignore` ni hagas `git rm` de los PNG/JPG hasta verificar que los archivos WebP estén subidos, que `images:paths:check` pase y que la Wiki compile correctamente.

Los paths faltantes o mal escritos que ya existían antes de la migración serán reportados, pero el script no decidirá por sí mismo a qué archivo deben apuntar.
