# Cuerpos narrativos MDX

Cada archivo de esta carpeta contiene solamente el cuerpo de un documento. Los metadatos, relaciones,
visibilidad y navegación permanecen en `src/data/documents.json`.

Además de Markdown (headings, listas, tablas, citas, links e imágenes), se permiten estos componentes:

- `<Quote cite="Nombre">…</Quote>`: cita editorial con atribución opcional.
- `<Callout title="Título" tone="note|warning|mystery">…</Callout>`: recuadro destacado.
- `<Spoiler summary="Texto del botón">…</Spoiler>`: contenido desplegable.
- `<DocumentImage src="/img/ruta.webp" alt="Descripción" caption="Pie opcional" />`: imagen con pie.
- `<Divider label="Descripción accesible opcional" />`: separador editorial.

No se permiten imports, exports, expresiones JavaScript entre llaves ni componentes distintos de los
anteriores. `npm run validate:data` y `npm run gen:documents` aplican esta política antes del build.
