# Imágenes y galerías del lector MDX

Base auditada: Wiki `main` en `f856469`. Contrato consultado en [CMS PR #14](https://github.com/sukumidev/hallyura-cms/pull/14) y su `mdxBridge/README.md`. La Biblioteca, sus estantes, `documents.json` y las rutas públicas no cambian.

## Contrato consumido

- `DocumentImage`: `src`, `alt`, `caption?`, `title?`, `size?` (`small`, `medium`, `large`, `full`) y `align?` (`left`, `center`, `right`). `title` conserva el título de una imagen Markdown anterior al pasar por el editor del CMS.
- `DocumentGallery`: `columns="1|2|3"` y uno o más `DocumentImage` como hijos directos, con atributos literales. El orden de las imágenes se conserva.
- Una imagen sin `size` ni `align` mantiene el estilo anterior. Las rutas públicas que comienzan con `/` se resuelven con el `baseUrl` de Docusaurus; los protocolos peligrosos y las referencias vacías se rechazan.

La validación del archivo MDX usa el AST de `remark-parse` y `remark-mdx`. Rechaza imports, exports, expresiones, HTML y componentes no registrados, atributos dinámicos o repetidos y estructuras de galería inválidas. El lector aplica `MDXProvider` a los cuerpos compilados: registrar un componente en `src/theme/MDXComponents.tsx` por sí solo no lo ponía a disposición de estas rutas MDX personalizadas.

## Revisión visual

Se compiló y renderizó un MDX temporal con siete imágenes, una galería de tres columnas, otra de dos y una imagen completa; los archivos del fixture se retiraron. El HTML generado mantuvo figuras y captions sin anidar figuras en párrafos. Chrome confirmó que no había scroll horizontal a 1440, 768, 390 ni 320 px. La galería de tres columnas pasó a dos en tablet y una en móvil. Las imágenes verticales y horizontales conservaron su proporción.

[Captura de escritorio](screenshots/editorial-gallery-desktop.png) · [Captura móvil](screenshots/editorial-gallery-mobile.png)
