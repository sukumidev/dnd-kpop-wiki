import React from 'react';
import Link from '@docusaurus/Link';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import characters from '@site/src/data/characters.json';

type FactionDocFrontMatter = {
  factionId?: string;
};

type LinkRef = {
  label?: string;
  doc?: string;
};

type CharacterEntry = {
  id?: string;
  title?: string;
  subtitle?: string;
  role?: string;
  group?: string;
  imageSrc?: string;
  faction?: LinkRef;
  occupation?: string[];
};

type CharactersJson = Record<string, CharacterEntry>;

export default function FactionMembersFromDoc() {
  const { frontMatter } = useDoc();
  const factionId = (frontMatter as FactionDocFrontMatter).factionId;

  if (!factionId) {
    return <p>No se encontró <code>factionId</code> en el frontmatter.</p>;
  }

  const factionDoc = `factions/${factionId}`;

  const members = Object.entries(characters as CharactersJson)
  .filter(([, character]) => character.faction?.doc === factionDoc);

  if (!members.length) {
    return <p>Aún no hay miembros registrados para esta facción.</p>;
  }

  return (
    <ul>
      {members.map(([id, character]) => (
  <li key={id}>
    <Link to={`/characters/${character.group ?? 'misc'}/${id}`}>
      {character.title ?? id}
    </Link>
    {(character.occupation?.[0] || character.role) ? (
      <> — {character.occupation?.[0] ?? character.role}</>
    ) : null}
  </li>
))}
    </ul>
  );
}