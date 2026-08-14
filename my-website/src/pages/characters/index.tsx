import React, {useMemo} from "react";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import {useBaseUrlUtils} from "@docusaurus/useBaseUrl";
import {getStatblock} from "@site/src/data/statblocks";
import {mythicCharacterIds} from "@site/src/data/cosmology";
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
  const {withBaseUrl} = useBaseUrlUtils();

  const directoryCharacters = useMemo(
    () => characterList.filter((character) => !mythicCharacterIds.has(character.id)),
    [],
  );

  const groupedCharacters = useMemo(() => {
    return directoryCharacters.reduce<Record<string, CharacterGroup>>((groups, character) => {
      const faction = getFactionById(character.factionId);
      const groupKey = faction?.id ?? OTHER_GROUP_ID;

      groups[groupKey] ??= {
        faction,
        characters: [],
      };

      groups[groupKey].characters.push(character);
      return groups;
    }, {});
  }, [directoryCharacters]);

  const sections = useMemo(() => {
    return Object.entries(groupedCharacters)
      .map(([id, group]) => ({id, ...group}))
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
    <Layout title="Personajes" description="Personajes del universo">
      <main className={styles.page}>
        <div className="container">
          <header className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <div className={styles.kicker}>Archivo de protagonistas</div>
              <h1 className={styles.pageTitle}>Directorio de personajes</h1>
              <p className={styles.pageSubtitle}>
                Héroes, aliados, rivales y habitantes que han dejado huella en el mundo.
              </p>
            </div>
            <div
              className={styles.total}
              aria-label={`${directoryCharacters.length} personajes`}
            >
              <strong>{directoryCharacters.length}</strong>
              <span>personajes</span>
            </div>
          </header>

          {sections.map((section) => {
            const sectionTitle = section.faction?.title ?? "Otros";
            const factionPath = section.faction
              ? `/factions/${section.faction.id}`
              : undefined;
            const sectionEyebrow =
              section.faction?.subtitle ?? section.faction?.type ?? "Sin afiliación";
            const sectionDescription =
              section.faction?.summary ??
              section.faction?.description ??
              (section.faction
                ? `Personajes vinculados a ${section.faction.title}.`
                : "Personajes que todavía no pertenecen a una facción registrada.");

            return (
              <details key={section.id} className={styles.section} open>
                <summary className={styles.sectionHeader}>
                  <div className={styles.sectionHeading}>
                    <div className={styles.sectionEyebrow}>{sectionEyebrow}</div>
                    <Heading as="h2" className={styles.sectionTitle}>
                      {sectionTitle}
                      <span className={styles.count}>{section.characters.length}</span>
                    </Heading>
                    <p className={styles.sectionDescription}>{sectionDescription}</p>
                  </div>

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
                      const imageUrl = character.imageSrc
                        ? withBaseUrl(character.imageSrc)
                        : undefined;
                      const docPath = getCharacterDocPath(character);
                      const isDeceased = character.status === "dead";
                      const captionText = getCharacterCaption(character);
                      const classEntries = getStatblock(character.id)?.classes ?? [];

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
                            <div className={styles.imageWrap}>
                              {imageUrl ? (
                                <>
                                  <img
                                    className={`${styles.image} ${
                                      isDeceased ? styles.imageDeceased : ""
                                    }`}
                                    src={imageUrl}
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
                                <div className={styles.imageFallback} aria-hidden="true">
                                  <span className={styles.fallbackMark}>✦</span>
                                </div>
                              )}
                            </div>

                            <div className={styles.cardBottom}>
                              <Heading as="h3" className={styles.cardName}>
                                {character.title}
                              </Heading>
                              {character.subtitle ? (
                                <div className={styles.subtitle}>
                                  {character.subtitle}
                                </div>
                              ) : null}
                              {classEntries.length ? (
                                <div
                                  className={styles.classList}
                                  aria-label="Clase y subclase"
                                >
                                  {classEntries.map((classEntry) => (
                                    <span
                                      key={`${classEntry.name}-${classEntry.subclass ?? "base"}`}
                                      className={styles.classEntry}
                                    >
                                      <strong>{classEntry.name}</strong>
                                      {classEntry.subclass ? (
                                        <span>{classEntry.subclass}</span>
                                      ) : null}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                              <div className={styles.caption}>{captionText}</div>
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
