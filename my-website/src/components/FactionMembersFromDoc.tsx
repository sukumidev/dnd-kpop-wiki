import React from 'react';
import Link from '@docusaurus/Link';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import {
  getCharacterDocPath,
  getCharactersByFactionId,
} from '@site/src/data/relationships';

type FactionDocFrontMatter = {
  factionId?: string;
};

export default function FactionMembersFromDoc() {
  const { frontMatter } = useDoc();
  const factionId = (frontMatter as FactionDocFrontMatter).factionId;

  if (!factionId) {
    return <p>No se encontró <code>factionId</code> en el frontmatter.</p>;
  }

  const members = getCharactersByFactionId(factionId);

  if (!members.length) {
    return <p>Aún no hay miembros registrados para esta facción.</p>;
  }

  return (
    <ul>
      {members.map((character) => (
  <li key={character.id}>
    <Link to={`/${getCharacterDocPath(character)}`}>
      {character.title}
    </Link>
    {(character.subtitle || character.role) ? (
      <> — {character.subtitle ?? character.role}</>
    ) : null}
  </li>
))}
    </ul>
  );
}
