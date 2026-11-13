# Cuerpos narrativos MDX

Cada archivo de esta carpeta contiene solamente el cuerpo de un documento. Los metadatos, relaciones,
visibilidad y navegación permanecen en `src/data/documents.json`.

Además de Markdown (headings, listas, tablas, citas, links e imágenes), se permiten estos componentes:

- `<Quote cite="Nombre">…</Quote>`: cita editorial con atribución opcional.
- `<Callout title="Título" tone="note|warning|mystery">…</Callout>`: recuadro destacado.
- `<Spoiler summary="Texto del botón">…</Spoiler>`: contenido desplegable.
- `<DocumentImage src="/img/ruta.webp" alt="Descripción" caption="Pie opcional" />`: imagen con pie. Admite `size="small|medium|large|full"`, `align="left|center|right"` y `title` opcionales.
- `<DocumentGallery columns="2">…</DocumentGallery>`: galería de 1, 2 o 3 columnas con uno o más `DocumentImage` como hijos directos.
- `<Divider label="Descripción accesible opcional" />`: separador editorial.

Los tamaños y alineaciones ausentes conservan el diseño anterior. Las rutas públicas de imagen se
resuelven con el `baseUrl` del sitio. Una galería válida, según el contrato del CMS, tiene esta forma:

```mdx
<DocumentGallery columns="2">
<DocumentImage src="/img/documents/escena-uno.webp" alt="Primera escena" caption="El puerto" />
<DocumentImage src="/img/documents/escena-dos.webp" alt="Segunda escena" size="small" align="right" />
</DocumentGallery>
```

No se permiten imports, exports, expresiones JavaScript entre llaves, HTML arbitrario, atributos
dinámicos ni componentes distintos de los anteriores. `npm run validate:data` y
`npm run gen:documents` aplican esta política antes del build.
