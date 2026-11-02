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


## 2. Rellenar `imageSrc: null` en personajes

El comando de rutas WebP anterior solo migra extensiones de rutas **existentes**. Para preparar una ruta en personajes cuya imagen todavía no existe, hay un script independiente:

```bash
npm run images:fill-null-paths:dry
npm run images:fill-null-paths
npm run images:fill-null-paths:check
npm run test:fill-null-paths
```

Aplica a `src/data/characters.json` y todos los archivos `src/data/characters/*.json` (sin tocar backups), únicamente cuando `imageSrc === null`. No modifica rutas existentes, galerías, otros metadatos ni los IDs.

Resuelve el directorio en este orden:

1. `factionId` explícito, si lo hay (por ejemplo, `riize`).
2. Prefijo de facción reconocido en el ID, obtenido de `factions.json` (por ejemplo, `txt-beomgyu` → `txt` o `omega-x-jaehan` → `omega-x`).
3. Prefijos especiales de ID: `actor-` → `actors/`, `pet-` → `pets/`, `enemy-` → `enemies/`, `solo-` → `solo/`, `npc-` → `npc/`, entre otros.
4. Como última opción, `group` (`npc` o `party`).

La ruta resultante tiene formato `/img/characters/<carpeta>/<id>.webp`. **No se requiere que exista el archivo físico WebP**: la ruta se guarda anticipadamente para que luego coloques el archivo exacto. Se muestra un aviso por las imágenes que aún faltan. Si la ruta no puede resolverse sin inventar datos, el registro queda intacto y se reporta para revisión.

Ejemplo: `"txt-beomgyu": { "id": "txt-beomgyu", "group": "npc", "imageSrc": null }` → `"/img/characters/txt/txt-beomgyu.webp"`.

**Importante:** preparar la ruta no crea la imagen. Hasta colocar el archivo, la Wiki puede mostrar un placeholder o un enlace roto, según el componente. El `--check` verifica que no queden nulls que el script pueda resolver, **no** que existan todas las imágenes.
