import React from 'react';
import Link from '@docusaurus/Link';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import {
  getFactionById,
  type FactionSubunit,
} from '@site/src/data/relationships';
import {
  getCharacterById,
  getCharacterDocPath,
  type Character,
} from '@site/src/data/relationships';
import { isVisibleCharacter } from '@site/src/data/characters';

type FactionDocFrontMatter = {
  factionId?: string;
};

function CharacterLink({ character }: { character: Character }) {
  return (
    <Link to={`/${getCharacterDocPath(character)}`}>
      {character.title}
    </Link>
  );
}

function FactionSubunitBlock({ subunit }: { subunit: FactionSubunit }) {
  const leaderCharacter = subunit.leaderCharacterId
    ? getCharacterById(subunit.leaderCharacterId)
    : undefined;
  const leader = leaderCharacter && isVisibleCharacter(leaderCharacter)
    ? leaderCharacter
    : undefined;
  const members = (subunit.memberIds ?? [])
    .map((id) => getCharacterById(id))
    .filter((character): character is Character => Boolean(character) && isVisibleCharacter(character));

  return (
    <div key={subunit.id} style={{ marginBottom: '1.25rem' }}>
      <h3>{subunit.title}</h3>

      {subunit.role ? <p><b>Rol:</b> {subunit.role}</p> : null}

      {leader ? (
        <p>
          <b>Lider:</b>{' '}
          <CharacterLink character={leader} />
        </p>
      ) : null}

      {subunit.bullets?.length ? (
        <ul>
          {subunit.bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      ) : null}

      {members.length ? (
        <p>
          <b>Miembros:</b>{' '}
          {members.map((member, i) => (
            <span key={member.id}>
              <CharacterLink character={member} />
              {i < members.length - 1 ? ' · ' : ''}
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}

export default function FactionSubunitsFromDoc() {
  const { frontMatter } = useDoc();
  const factionId = (frontMatter as FactionDocFrontMatter).factionId;
  const faction = factionId ? getFactionById(factionId) : undefined;
  const subunits = faction?.subunits ?? [];

  if (!factionId) {
    return <p>No se encontro <code>factionId</code> en el frontmatter.</p>;
  }

  if (!subunits.length) {
    return null;
  }

  return (
    <>
      {subunits.map((subunit) => (
        <FactionSubunitBlock key={subunit.id} subunit={subunit} />
      ))}
    </>
  );
}
