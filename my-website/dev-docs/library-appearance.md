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
- Valores admitidos: `ornament`: `filigree`, `stars`, `laurel`, `none`; `height`: `short`, `medium`, `tall`; `thickness`: `thin`, `medium`, `thick`; `texture`: `leather`, `cloth`, `aged`.

El editor futuro del CMS necesita controles para estos campos, selector de ubicación y reino del catálogo, vista previa del lomo y exportación del objeto dentro de `metadata.library`. Debe mostrar explícitamente el estado sin hallazgo registrado y permitir un lugar fuera de los reinos catalogados. No debe rellenar la procedencia a partir de las relaciones del documento.
