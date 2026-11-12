# Biblioteca de Hallyura: contrato de integración para CMS

La Wiki lee la extensión opcional `metadata.library` en **el mismo** documento exportado a `src/data/documents.json`. Las colecciones usan el mismo contrato (`documentKind: "collection"`); sus entradas siguen enlazadas al lector de la colección y no se distribuyen entre estantes.

```json
{
  "metadata": {
    "library": {
      "discoveredAt": "biblioteca-de-la-mansion-radiante",
      "discoveredRealmId": null,
      "hidden": false,
      "appearance": {
        "spineTitle": "Título para el lomo",
        "color": "#384a77",
        "accentColor": "#d8bc82",
        "symbol": "✦",
        "ornament": "filigree",
        "height": "tall",
        "thickness": "thick",
        "texture": "leather",
        "spineImage": null
      }
    }
  }
}
```

- `discoveredAt`: ID de la ubicación **donde se encontró** el volumen. Se recorre su jerarquía `regionId` / `parentLocationId` hasta un reino del catálogo. Tiene prioridad sobre `discoveredRealmId`.
- `discoveredRealmId`: ID de reino en `realmCatalog.json` si no hay ubicación de hallazgo más precisa. Un ID no catalogado va a «Otros lugares».
- Sin ambos campos, el volumen va a «Ubicación no registrada». `locationIds`, `sessionIds`, autor, tema y etiquetas no determinan el estante.
- `hidden: true` oculta solo el volumen de la Biblioteca. La visibilidad pública y el lector siguen regidos por `status` y `visibility`.
- `appearance` es opcional. Los colores deben tener formato `#RRGGBB`; `spineImage` debe ser una ruta pública del sitio que empiece con `/` (por ejemplo `/img/lomos/libro.webp`). Valores no válidos se reemplazan por presets deterministas en la interfaz y se reportan en `npm run validate:data`.
- Valores admitidos: `ornament`: `filigree`, `stars`, `laurel`, `none`, `circle`, `diamond`, `arcane`, `laurel-frame`, `filigree-frame`; `height`: `short`, `medium`, `tall`; `thickness`: `thin`, `medium`, `thick`; `texture`: `leather`, `cloth`, `aged`.

El CMS debe conservar los controles de estos campos, selector de ubicación y reino del catálogo, vista previa y exportación dentro de `metadata.library`. Debe mostrar explícitamente el estado sin hallazgo registrado y permitir un lugar fuera de los reinos catalogados. No debe rellenar la procedencia a partir de las relaciones del documento.

## Objetos de archivo (integración CMS)

El CMS actual exporta tres campos opcionales adicionales dentro de **este mismo** `appearance`:

```ts
type ArchiveDisplayMode = "book" | "letter" | "newspaper" | "dossier" | "notice" | "scroll";
type ArchiveMaterial = "leather" | "cloth" | "parchment" | "newsprint" | "canvas" | "aged-paper";
type ArchiveWear = "new" | "used" | "ancient";
// BookAppearance añade displayMode?, material? y wear?.
```

Si `displayMode` falta o no es válido, se muestra el libro legacy sin cambios. Los presets del CMS se exportan como valores explícitos; `displayMode` aislado cambia la silueta y el material predeterminado, conservando los colores, símbolo y dimensiones deterministas de la Wiki. Las personalizaciones válidas prevalecen. `wear` ausente usa `new`. Los materiales incompatibles con la silueta usan un acabado seguro: `book → leather`, `letter → parchment`, `newspaper → newsprint`, `dossier → canvas`, `notice → leather`, `scroll → aged-paper`. `texture` y `spineImage` continúan aplicándose a `book`.

El CMS guarda los **32 símbolos históricos como glifos** (`☾`, `⚔`, `✒`) y los **doce nuevos como IDs SVG** (`paw-print`, `card-spade`, etc.). La Wiki usa un registro único en `src/data/archiveSymbols.ts`, resuelve ambos formatos y aplica el símbolo predeterminado determinista si recibe uno desconocido. Los SVG aprobados están en `static/img/symbols/`; `src/data/archiveVectorAssets.json` especifica los únicos que se copian al build público.

Ejemplos de `metadata.library.appearance` para cada silueta, sin agregar documentos ficticios al JSON narrativo:

| Objeto | `appearance` de ejemplo |
| --- | --- |
| Libro | `{ "displayMode": "book", "texture": "cloth", "symbol": "☾" }` |
| Carta | `{ "displayMode": "letter", "material": "parchment", "wear": "used", "symbol": "✉" }` |
| Gaceta | `{ "displayMode": "newspaper", "material": "newsprint", "symbol": "☼" }` |
| Expediente | `{ "displayMode": "dossier", "material": "canvas", "symbol": "▣" }` |
| Anuncio | `{ "displayMode": "notice", "material": "leather", "symbol": "⚔" }` |
| Pergamino | `{ "displayMode": "scroll", "material": "aged-paper", "wear": "ancient", "symbol": "⊛" }` |

Para combinar símbolo y marco se conservan los dos campos independientes: por ejemplo `{ "symbol": "paw-print", "ornament": "circle" }` o `{ "symbol": "card-spade", "ornament": "filigree-frame" }`. Los acabados clásicos `filigree`, `stars` y `laurel` siguen renderizándose como antes. Los nombres con sufijo `-frame` son los IDs reales del CMS.

La auditoría de ramas, el origen de los SVG y la política del build público se documentan en `dev-docs/library-cms-integration.md`.
