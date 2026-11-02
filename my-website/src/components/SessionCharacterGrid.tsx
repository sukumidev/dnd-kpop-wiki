import React from "react";
import {getCharacterById} from "@site/src/data/characters";
import {sessionList} from "@site/src/data/sessions";
import CharacterGrid from "./CharacterGrid";

type Props = {sessionId: string};

export default function SessionCharacterGrid({sessionId}: Props) {
  const session = sessionList.find((item) => item.id === sessionId);
  if (!session) return null;

  const characters = (session.characterIds ?? [])
    .map(getCharacterById)
    .filter((character) => character !== undefined);

  return <CharacterGrid characters={characters} label="Personajes que aparecieron" />;
}
