import assert from "node:assert/strict";
import test from "node:test";
import {
  hasMeaningfulIntroduction,
  isLegacyEmptyProfile,
} from "../scripts/audit-character-doc-duplicates.mjs";

const legacy = `---
title: "Park Seonghwa"
characterId: "ateez-seonghwa"
---

import CharacterPageFromDoc from '@site/src/components/CharacterPageFromDoc';
import CharacterImageCarousel from '@site/src/components/CharacterImageCarousel';

<CharacterPageFromDoc>

<!-- Escribe aquí tu lore en markdown -->

## Resumen
- …

## Apariencia

### Otros Looks
<CharacterImageCarousel />
- …

## Personalidad
- …

## Backstory
- …

## Vida actual
- …

## Relaciones
- …

## Apariciones
- …

## Datos curiosos
- …

</CharacterPageFromDoc>
`;

test("recognizes the exact legacy placeholder and nothing else", () => {
  assert.equal(isLegacyEmptyProfile(legacy), true);
  assert.equal(isLegacyEmptyProfile(legacy.replace("- …", "- Participó en una misión.")), false);
  assert.equal(isLegacyEmptyProfile(legacy.replace("<!-- Escribe aquí tu lore en markdown -->", "")), false);
});

test("requires a substantial canonical introduction before safe removal", () => {
  assert.equal(hasMeaningfulIntroduction("<CharacterIntroduction>\\n- ...\\n</CharacterIntroduction>"), false);
  assert.equal(hasMeaningfulIntroduction("<CharacterIntroduction>Esta página todavía necesita contenido.</CharacterIntroduction>"), false);
  assert.equal(hasMeaningfulIntroduction(
    "<CharacterIntroduction>Park Seonghwa es el primer oficial de la Marea Negra y antiguo guardián de fronteras planares de Hallyura.</CharacterIntroduction>",
  ), true);
});
