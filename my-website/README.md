# Hallyura Wiki

Wiki del universo de Hallyura. Los devlogs y anuncios se publican en Discord; este sitio no tiene blog.

## Requisitos

- Node.js 20.18.1 o posterior.
- npm (incluido con Node.js).

## Instalación y desarrollo local

```bash
npm ci
npm run start
```

El servidor de desarrollo usa `http://localhost:3000` de forma predeterminada.

## Validaciones

```bash
npm run typecheck
npm run validate:data
npm test
```

## Build

```bash
SITE_URL=http://localhost:3000 BASE_URL=/ npm run build
```

En PowerShell:

```powershell
$env:SITE_URL = 'http://localhost:3000'
$env:BASE_URL = '/'
npm run build
```

`SITE_URL` indica el origen del sitio y `BASE_URL` la ruta base. Si no se definen, se usan `http://localhost:3000` y `/`, respectivamente. El dominio real deberá definirse antes del release a producción; aún no se ha elegido proveedor de hosting.
