import React from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import { getFactionMembers } from '@site/src/data/relationships';
import CharacterGrid from './CharacterGrid';

type FactionDocFrontMatter = {
  factionId?: string;
};

export default function FactionMembersFromDoc() {
  const { frontMatter } = useDoc();
  const factionId = (frontMatter as FactionDocFrontMatter).factionId;

  const members = factionId ? getFactionMembers(factionId) : [];
  if (!members.length) return null;

  return (
    <section aria-label="Miembros de la facción">
      <h2>Miembros</h2>
      <CharacterGrid characters={members} label="Miembros de la facción" />
    </section>
  );
}
