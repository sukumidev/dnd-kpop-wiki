# Ilustraciones de Los Reinos de Hallyura

La landing espera las ilustraciones originales en `static/img/realms/`:

- `hyberia-alt.webp` — versión verde con valles, campos, ríos y aldeas; nunca usar la versión roja del eclipse.
- `sylmorien.webp`
- `jeyperia.webp`
- `ygdrassil.webp` — respetar esta grafía del archivo.
- `hotou.webp`
- `guozhong.webp`

Los WebP de Sylmorien, Jeyperia, Yggdrasil, Hotou y Guozhong ya están en el repositorio. También está `hyberia.webp`, que muestra la versión verde y se usa en el índice `/world`. La landing todavía espera `hyberia-alt.webp`; hasta que exista ese nombre, su tarjeta muestra «Ilustración pendiente». Estas imágenes no reemplazan `imageSrc` de las fichas de ubicaciones. La caja de la landing reserva una proporción de 1:1 y muestra el archivo completo mediante `object-fit: contain`.

La galería obtiene las rutas de `getPublicRealmHref`. En el proyecto local del Escritorio ya existen las seis páginas `docs/world/realms/`. Si una ruta deja de estar publicada, su tarjeta se muestra sin enlace para evitar navegación rota.
