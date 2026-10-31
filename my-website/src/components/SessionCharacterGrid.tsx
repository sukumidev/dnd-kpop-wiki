import React from "react";
import Link from "@docusaurus/Link";
import {useBaseUrlUtils} from "@docusaurus/useBaseUrl";
import {getCharacterById, getCharacterDocPath} from "@site/src/data/characters";
import {sessionList} from "@site/src/data/sessions";
import styles from "./SessionCharacterGrid.module.css";

type Props = {sessionId: string};

const shortNames: Record<string, string> = {
  "svt-scoups": "S.Coups",
  "svt-jeonghan": "Jeonghan",
  "svt-joshua": "Joshua",
  "svt-hoshi": "Hoshi",
  "svt-mingyu": "Mingyu",
  "svt-seungkwan": "Seungkwan",
  "svt-wonwoo": "Wonwoo",
  "svt-dino": "Dino",
  "svt-dk": "DK",
  "svt-jun": "Jun",
  "svt-vernon": "Vernon",
  "svt-woozi": "Woozi",
  "svt-minghao": "Minghao",
};

export default function SessionCharacterGrid({sessionId}: Props) {
  const {withBaseUrl} = useBaseUrlUtils();
  const session = sessionList.find((item) => item.id === sessionId);
  if (!session) return null;

  const characters = (session.characterIds ?? [])
    .map(getCharacterById)
    .filter((character) => character !== undefined);

  return (
    <ul className={styles.grid} aria-label="Personajes que aparecieron">
      {characters.map((character) => {
        const initials = character.title
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join("");

        return (
          <li key={character.id} className={styles.item}>
            <Link
              to={`/${getCharacterDocPath(character)}`}
              className={styles.card}
              aria-label={`Abrir ficha de ${character.title}`}
            >
              <span className={styles.portrait}>
                {character.imageSrc ? (
                  <img src={withBaseUrl(character.imageSrc)} alt="" loading="lazy" />
                ) : (
                  <span className={styles.initials} aria-hidden="true">{initials}</span>
                )}
              </span>
              <span className={styles.name}>{shortNames[character.id] ?? character.title}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
