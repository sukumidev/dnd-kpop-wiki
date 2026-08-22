// src/components/CharacterPage.tsx
import React from "react";
import Infobox from "@site/src/components/Infobox";
import Statblock from "@site/src/components/Statblock";
import CharacterSplitLayout from "@site/src/components/CharacterSplitLayout";
import RelatedDocumentsSection from "@site/src/components/documents/RelatedDocumentsSection";
import { getCharacterById } from "@site/src/data/characters";
import { characterJsonToSections, type CharacterJson } from "@site/src/utils/infoboxJson";
import { CharacterProvider } from "@site/src/components/CharacterContext";
import { getStatblock } from "@site/src/data/statblocks"; // ✅ NEW

type Props = {
  id: string;
  introduction?: React.ReactNode;
  children: React.ReactNode;
};

// normalizador (para accents)
function normalizeClass(value: unknown) {
  return (value ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)/g, "") // opcional: quita "(...)" si alguna vez aparece
    .replace(/\s+/g, "")
    .replace(/[^a-z_-]/g, "");
}

export default function CharacterPage({ id, introduction, children }: Props) {
  const c = getCharacterById(id);

  if (!c) {
    return (
      <div>
        <p>
          Personaje <code>{id}</code> no encontrado 😭
        </p>
        {children}
      </div>
    );
  }

  // Accent por clase del JSON (fallbacks)
  const legacyCharacter = c as typeof c & { class?: unknown; classes?: unknown[]; caption?: string };
  const accentClass = normalizeClass(legacyCharacter.class ?? legacyCharacter.classes?.[0]);

  // ✅ Solo mostramos statblock si existe
  const sb = getStatblock(id);

  return (
    <CharacterProvider id={id}>
      <CharacterSplitLayout
        side={
          <Infobox
            title={c.title ?? id}
            subtitle={c.subtitle}
            imageSrc={c.imageSrc}
            caption={legacyCharacter.caption}
            sections={characterJsonToSections(c as unknown as CharacterJson)}
            accentClass={accentClass}
          />
        }
        introduction={introduction}
        statblock={sb ? <Statblock id={id} /> : null}
      >
        {children}
        <RelatedDocumentsSection characterId={id} />
      </CharacterSplitLayout>
    </CharacterProvider>
  );
}
