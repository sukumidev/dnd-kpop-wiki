# Session Data Contract v0.1

## Propósito

`Session` contiene únicamente metadata y relaciones estructuradas de una sesión de campaña. El resumen, los bullets y cualquier otro contenido narrativo permanecen en el Markdown/MDX de la sesión.

## Fuente de verdad

```txt
src/data/sessions.json
```

Contrato TypeScript:

```txt
src/data/sessions.ts
```

El archivo usa un array de sesiones. `id` y `number` deben ser únicos.

## Campos

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `string` | Requerido, estable y en kebab-case; recomendado `session-17`. |
| `number` | `number` | Requerido y único; se usa para ordenar y construir la ruta. |
| `title` | `string` | Requerido; título visible. |
| `sessionDate` | `string` | Opcional; fecha real ISO `YYYY-MM-DD`. |
| `campaignDate` | `string` | Opcional; fecha narrativa sin calendario estructurado. |
| `locationIds` | `string[]` | Opcional; IDs de `locations.json` en orden narrativo. El primero es el lugar inicial. |
| `characterIds` | `string[]` | Opcional; IDs de personajes que aparecen directamente en la sesión. |
| `imageSrc` | `string` | Opcional; portada. |
| `imagePosition` | `string` | Opcional; valor compatible con `object-position` o `background-position`. |

## Relaciones derivadas

- La card del índice resuelve únicamente `locationIds[0]` como lugar inicial.
- La página individual puede resolver todo `locationIds` para listar los lugares visitados.
- Las apariciones de un personaje se calculan filtrando sesiones cuyo `characterIds` contenga el ID del personaje.
- No se mantiene un array inverso `sessionIds` en cada personaje.

## Límites del contrato

No agregar `summary`, `events`, `bullets` ni `highlights` a `sessions.json`. El contenido narrativo vive en `docs/campaign/sessions/`.

## Ejemplo mínimo

```json
{
  "id": "session-17",
  "number": 17,
  "title": "El Dios que no terminó de despertar",
  "sessionDate": "2026-08-17",
  "campaignDate": "27 de diciembre, Segunda Era",
  "locationIds": ["neo-academia", "neocity"],
  "characterIds": ["pc-kiyori", "pc-minjae"],
  "imageSrc": "/img/sessions/session-17.webp",
  "imagePosition": "center 35%"
}
```

## Validación

Son errores los campos requeridos ausentes o duplicados, fechas ISO inválidas, arrays de relaciones inválidos y referencias inexistentes. La ausencia de fechas opcionales, lugares, personajes o imagen produce warnings y no impide publicar la sesión.
