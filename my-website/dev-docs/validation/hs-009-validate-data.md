# HS-009 — Validar IDs únicos

Este paquete contiene el script inicial para validar IDs y reglas críticas de datos compartidos.

## Archivo

```txt
scripts/validate-data.ts
```

## Instalación

Copia el archivo al proyecto:

```bash
mkdir -p scripts
cp scripts/validate-data.ts <tu-proyecto>/scripts/validate-data.ts
```

## package.json

Agrega:

```json
{
  "scripts": {
    "validate:data": "tsx scripts/validate-data.ts"
  }
}
```

## Uso

```bash
npm run validate:data
```

O directamente:

```bash
npx tsx scripts/validate-data.ts
```

## Qué valida

- IDs requeridos.
- IDs en lowercase kebab-case.
- Key raíz igual a `id` interno.
- IDs internos únicos en:
  - quest objectives
  - faction subunits
  - mapConfig layers
  - mapConfig icons
- Enums básicos:
  - character status/group/dynamic/polyamoryStatus
  - quest status/visibility
  - faction status
  - location status
- Campos legacy removidos de `characters.json`.
- Campo legacy `keyMembers` en `factions.json`.
- Coordenadas de mapa visibles.
- Referencias faltantes como warnings.
- Ciclos en `parentQuestId`.

## Resultado

Errores críticos detienen el proceso con exit code `1`.

Warnings no detienen el proceso.
