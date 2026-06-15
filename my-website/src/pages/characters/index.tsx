import React, { useMemo } from "react";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

import {
  characterList,
  getCharacterDocPath,
  getFactionById,
  getLocationById,
  type Character,
  type Faction,
} from "@site/src/data/relationships";

type CharacterGroup = {
  faction?: Faction;
  characters: Character[];
};

const OTHER_GROUP_ID = "otros";

function getCharacterCaption(character: Character) {
  const faction = getFactionById(character.factionId);
  const region = getLocationById(character.regionId);

  if (faction?.title && region?.title) {
    return `${faction.title} — ${region.title}`;
  }

  return faction?.title ?? region?.title ?? "Otros";
}

export default function CharactersPage() {
  const { withBaseUrl } = useBaseUrlUtils();

  const groupedCharacters = useMemo(() => {
    return characterList.reduce<Record<string, CharacterGroup>>((groups, character) => {
      const faction = getFactionById(character.factionId);
      const groupKey = faction?.id ?? OTHER_GROUP_ID;

      groups[groupKey] ??= {
        faction,
        characters: [],
      };

      groups[groupKey].characters.push(character);
      return groups;
    }, {});
  }, []);

  const sections = useMemo(() => {
    return Object.entries(groupedCharacters)
      .map(([id, group]) => ({ id, ...group }))
      .sort((a, b) => {
        if (a.id === OTHER_GROUP_ID) return 1;
        if (b.id === OTHER_GROUP_ID) return -1;

        const aOrder = a.faction?.sortOrder ?? Number.MAX_SAFE_INTEGER;
        const bOrder = b.faction?.sortOrder ?? Number.MAX_SAFE_INTEGER;

        if (aOrder !== bOrder) return aOrder - bOrder;
        return (a.faction?.title ?? a.id).localeCompare(b.faction?.title ?? b.id);
      });
  }, [groupedCharacters]);

  return (
    <Layout title="Characters" description="Personajes del universo">
      <main className={styles.page}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Todos los personajes</h1>
          </div>

          {sections.map((section) => {
            const sectionTitle = section.faction?.title ?? "Otros";
            const factionPath = section.faction
              ? `/factions/${section.faction.id}`
              : undefined;

            return (
              <details key={section.id} className={styles.section} open>
                <summary className={styles.sectionHeader}>
                  <Heading as="h2" className={styles.sectionTitle}>
                    {sectionTitle}
                  </Heading>

                  <div className={styles.sectionActions}>
                    {factionPath ? (
                      <Link
                        className={styles.sectionCta}
                        to={withBaseUrl(factionPath)}
                        onClick={(event) => event.stopPropagation()}
                        onMouseDown={(event) => event.stopPropagation()}
                      >
                        Ver facción <span className={styles.arrow}>→</span>
                      </Link>
                    ) : null}

                    <span className={styles.chevron} aria-hidden="true" />
                  </div>
                </summary>

                <div className={styles.sectionBody}>
                  <div className={styles.grid}>
                    {section.characters.map((character) => {
                      const imgUrl = character.imageSrc
                        ? withBaseUrl(character.imageSrc)
                        : undefined;
                      const docPath = getCharacterDocPath(character);
                      const isDeceased = character.status === "dead";
                      const captionText = getCharacterCaption(character);

                      return (
                        <Link
                          key={character.id}
                          to={withBaseUrl(`/${docPath}`)}
                          className={styles.cardLink}
                          aria-label={`Abrir ficha de ${character.title}`}
                        >
                          <article
                            className={`${styles.card} ${
                              isDeceased ? styles.cardDeceased : ""
                            }`}
                          >
                            <div className={styles.cardTop}>
                              <div className={styles.cardName}>
                                {character.title}
                              </div>
                            </div>

                            <div className={styles.imageWrap}>
                              {imgUrl ? (
                                <>
                                  <img
                                    className={`${styles.image} ${
                                      isDeceased ? styles.imageDeceased : ""
                                    }`}
                                    src={imgUrl}
                                    alt={character.title}
                                    loading="lazy"
                                  />
                                  {isDeceased ? (
                                    <div className={styles.deceasedBadge}>
                                      ✝ Fallecido
                                    </div>
                                  ) : null}
                                </>
                              ) : (
                                <div className={styles.imageFallback}>
                                  No image
                                </div>
                              )}
                            </div>

                            <div className={styles.cardBottom}>
                              {character.subtitle ? (
                                <div className={styles.subtitle}>
                                  {character.subtitle}
                                </div>
                              ) : null}
                              {captionText ? (
                                <div className={styles.caption}>
                                  {captionText}
                                </div>
                              ) : null}
                            </div>
                          </article>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </main>
    </Layout>
  );
}
