import React from "react";
import Link from "@docusaurus/Link";
import {useBaseUrlUtils} from "@docusaurus/useBaseUrl";
import {getCharacterDocPath, type Character} from "@site/src/data/characters";
import {getMythicEntityByCharacterId} from "@site/src/data/cosmology";
import styles from "./CharacterGrid.module.css";

type Props = {
  characters: Character[];
  label: string;
};

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

export default function CharacterGrid({characters, label}: Props) {
  const {withBaseUrl} = useBaseUrlUtils();

  return (
    <ul className={styles.grid} aria-label={label}>
      {characters.map((character) => {
        const docPath =
          getMythicEntityByCharacterId(character.id)?.docPath ?? getCharacterDocPath(character);
        const initials = character.title
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join("");

        const content = (
          <>
            <span className={styles.portrait}>
              {character.imageSrc ? (
                <img src={withBaseUrl(character.imageSrc)} alt="" loading="lazy" />
              ) : (
                <span className={styles.initials} aria-hidden="true">{initials}</span>
              )}
            </span>
            <span className={styles.name}>{shortNames[character.id] ?? character.title}</span>
          </>
        );

        return (
          <li key={character.id} className={styles.item}>
            {character.hasProfile === false ? (
              <span className={styles.card}>{content}</span>
            ) : (
              <Link
                to={`/${docPath}`}
                className={styles.card}
                aria-label={`Abrir ficha de ${character.title}`}
              >
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
