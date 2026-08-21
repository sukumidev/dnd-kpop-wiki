import React, {useMemo} from "react";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import {useBaseUrlUtils} from "@docusaurus/useBaseUrl";
import WikiSidebarPageLayout from "@site/src/components/WikiSidebarPageLayout";
import {getStatblock} from "@site/src/data/statblocks";
import {mythicCharacterIds} from "@site/src/data/cosmology";
import {
  FEATURED_CHARACTER_FACTION_ID,
  NO_REALM_GROUP_ID,
  compareFactionsByPriority,
  compareRealmGroups,
  sortByExplicitOrderThenTitle,
} from "@site/src/utils/directoryOrdering";
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
  id: string;
  faction?: Faction;
  characters: Character[];
};

type RealmSection = {
  id: string;
  title: string;
  groups: CharacterGroup[];
  characterCount: number;
};

const NO_FACTION_GROUP_ID = "__no-faction__";

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

  const featuredCharacters = useMemo(() => {
    return sortByExplicitOrderThenTitle(
      directoryCharacters.filter(
        (character) => character.factionId === FEATURED_CHARACTER_FACTION_ID,
      ),
    );
  }, [directoryCharacters]);

  const featuredFaction = getFactionById(FEATURED_CHARACTER_FACTION_ID);

  const realmSections = useMemo(() => {
    const realms = new Map<string, Map<string, CharacterGroup>>();

    for (const character of directoryCharacters) {
      if (character.factionId === FEATURED_CHARACTER_FACTION_ID) continue;

      const realmId = character.regionId ?? NO_REALM_GROUP_ID;
      const faction = getFactionById(character.factionId);
      const factionGroupId = faction?.id ?? NO_FACTION_GROUP_ID;
      const realmGroups = realms.get(realmId) ?? new Map<string, CharacterGroup>();
      const group = realmGroups.get(factionGroupId) ?? {
        id: factionGroupId,
        faction,
        characters: [],
      };

      group.characters.push(character);
      realmGroups.set(factionGroupId, group);
      realms.set(realmId, realmGroups);
    }

    return [...realms.entries()]
      .map<RealmSection>(([id, realmGroups]) => {
        const groups = [...realmGroups.values()]
          .map((group) => ({
            ...group,
            characters: sortByExplicitOrderThenTitle(group.characters),
          }))
          .sort((a, b) => {
            if (a.id === NO_FACTION_GROUP_ID) return 1;
            if (b.id === NO_FACTION_GROUP_ID) return -1;
            return compareFactionsByPriority(a.faction!, b.faction!);
          });

        return {
          id,
          title:
            id === NO_REALM_GROUP_ID
              ? "Sin reino"
              : getLocationById(id)?.title ?? id,
          groups,
          characterCount: groups.reduce(
            (total, group) => total + group.characters.length,
            0,
          ),
        };
      })
      .sort(compareRealmGroups);
  }, [directoryCharacters]);

  function renderCharacterGrid(characters: Character[]) {
    return (
      <div className={styles.grid}>
        {characters.map((character) => {
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
                className={`${styles.card} ${isDeceased ? styles.cardDeceased : ""}`}
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
                        <div className={styles.deceasedBadge}>✝ Fallecido</div>
                      ) : null}
                    </>
                  ) : (
                    <div className={styles.imageFallback} aria-hidden="true">
                      <span className={styles.fallbackMark}>✦</span>
                    </div>
                  )}
                </div>

                <div className={styles.cardBottom}>
                  <Heading as="h4" className={styles.cardName}>
                    {character.title}
                  </Heading>
                  {character.subtitle ? (
                    <div className={styles.subtitle}>{character.subtitle}</div>
                  ) : null}
                  {classEntries.length ? (
                    <div className={styles.classList} aria-label="Clase y subclase">
                      {classEntries.map((classEntry) => (
                        <span
                          key={`${classEntry.name}-${classEntry.subclass ?? "base"}`}
                          className={styles.classEntry}
                        >
                          <strong>{classEntry.name}</strong>
                          {classEntry.subclass ? <span>{classEntry.subclass}</span> : null}
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
    );
  }

  return (
    <WikiSidebarPageLayout title="Personajes" description="Personajes del universo">
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

          {featuredCharacters.length ? (
            <details className={styles.section} open>
              <summary className={styles.sectionHeader}>
                <div className={styles.sectionHeading}>
                  <div className={styles.sectionEyebrow}>
                    {featuredFaction?.subtitle ?? featuredFaction?.type}
                  </div>
                  <Heading as="h2" className={styles.sectionTitle}>
                    {featuredFaction?.title ?? FEATURED_CHARACTER_FACTION_ID}
                    <span className={styles.count}>{featuredCharacters.length}</span>
                  </Heading>
                  <p className={styles.sectionDescription}>
                    {featuredFaction?.summary ?? featuredFaction?.description}
                  </p>
                </div>
                <div className={styles.sectionActions}>
                  {featuredFaction ? (
                    <Link
                      className={styles.sectionCta}
                      to={withBaseUrl(`/factions/${featuredFaction.id}`)}
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
                {renderCharacterGrid(featuredCharacters)}
              </div>
            </details>
          ) : null}

          {realmSections.map((realm) => (
            <details key={realm.id} className={styles.section} open>
              <summary className={styles.sectionHeader}>
                <div className={styles.sectionHeading}>
                  <div className={styles.sectionEyebrow}>Reino</div>
                  <Heading as="h2" className={styles.sectionTitle}>
                    {realm.title}
                    <span className={styles.count}>{realm.characterCount}</span>
                  </Heading>
                </div>
                <div className={styles.sectionActions}>
                  <span className={styles.chevron} aria-hidden="true" />
                </div>
              </summary>

              <div className={styles.sectionBody}>
                {realm.groups.map((group) => {
                  const title = group.faction?.title ?? "Sin facción";

                  return (
                    <section key={group.id} className={styles.factionGroup}>
                      <header className={styles.factionGroupHeader}>
                        <div>
                          <Heading as="h3" className={styles.factionGroupTitle}>
                            {title}
                            <span className={styles.count}>{group.characters.length}</span>
                          </Heading>
                          <p className={styles.factionGroupDescription}>
                            {group.faction?.summary ??
                              (group.faction
                                ? `Personajes vinculados a ${group.faction.title}.`
                                : "Personajes sin una facción registrada válida.")}
                          </p>
                        </div>
                        {group.faction ? (
                          <Link
                            className={styles.sectionCta}
                            to={withBaseUrl(`/factions/${group.faction.id}`)}
                          >
                            Ver facción <span className={styles.arrow}>→</span>
                          </Link>
                        ) : null}
                      </header>
                      {renderCharacterGrid(group.characters)}
                    </section>
                  );
                })}
              </div>
            </details>
          ))}
        </div>
      </main>
    </WikiSidebarPageLayout>
  );
}
