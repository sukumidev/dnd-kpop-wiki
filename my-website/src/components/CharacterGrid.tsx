import React from "react";
import Link from "@docusaurus/Link";
import {useBaseUrlUtils} from "@docusaurus/useBaseUrl";
import {getCharacterDocPath, type Character} from "@site/src/data/characters";
import {getMythicEntityByCharacterId} from "@site/src/data/cosmology";
import styles from "./CharacterGrid.module.css";

type Props = {
  characters: Character[];
  label: string;
  classDetails?: ReadonlyMap<string, {level?: number; subclass?: string}>;
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

export default function CharacterGrid({characters, label, classDetails}: Props) {
  const {withBaseUrl} = useBaseUrlUtils();
  const isClassDirectory = classDetails !== undefined;

  return (
    <ul className={`${styles.grid} ${isClassDirectory ? styles.classGrid : ''}`} aria-label={label}>
      {characters.map((character) => {
        const docPath =
          getMythicEntityByCharacterId(character.id)?.docPath ?? getCharacterDocPath(character);
        const initials = character.title
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join("");
        const details = classDetails?.get(character.id);

        const content = (
          <>
            <span className={`${styles.portrait} ${isClassDirectory ? styles.classPortrait : ''}`}>
              {character.imageSrc ? (
                <img src={withBaseUrl(character.imageSrc)} alt="" loading="lazy" />
              ) : (
                <span className={styles.initials} aria-hidden="true">{initials}</span>
              )}
            </span>
            <span className={`${styles.name} ${isClassDirectory ? styles.className : ''}`}>
              {isClassDirectory ? character.title : shortNames[character.id] ?? character.title}
            </span>
            {isClassDirectory && (details?.level !== undefined || details?.subclass) && (
              <span className={styles.classMeta}>
                {details.level !== undefined && <span className={styles.level}>Nivel {details.level}</span>}
                {details.subclass && <span className={styles.subclass}>{details.subclass}</span>}
              </span>
            )}
          </>
        );

        return (
          <li key={character.id} className={styles.item}>
            {character.hasProfile === false ? (
              <span className={`${styles.card} ${isClassDirectory ? styles.classCard : ''}`}>{content}</span>
            ) : (
              <Link
                to={`/${docPath}`}
                className={`${styles.card} ${isClassDirectory ? styles.classCard : ''}`}
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
