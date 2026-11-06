import React, {useMemo} from "react";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import {useBaseUrlUtils} from "@docusaurus/useBaseUrl";
import WikiSidebarPageLayout from "@site/src/components/WikiSidebarPageLayout";
import MysteryCards from "@site/src/components/MysteryCards";
import {getStatblock} from "@site/src/data/statblocks";
import {getMythicEntityByCharacterId, mythicCharacterIds} from "@site/src/data/cosmology";
import {
  NO_REALM_GROUP_ID,
  compareFactionsByPriority,
  compareRealmGroups,
  sortByExplicitOrderThenTitle,
} from "@site/src/utils/directoryOrdering";
import {sortFactionCharacters} from "@site/src/utils/characterFactionOrdering";
import styles from "./styles.module.css";
import {getPublicFactionHref} from "@site/src/data/publicRoutes";

import {
  characterList,
  factionList,
  getCharacterDocPath,
  getRootFactionById,
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
const HIDDEN_DIRECTORY_CHARACTER_IDS = new Set([
  "tvxq-jaejoong",
  "tvxq-junsu",
  "tvxq-yoochun",
  // Los Diez Omegas: fichas pendientes de foto.
  "omega-x-hyuk",
  "omega-x-jehyun",
  "omega-x-kevin",
  "omega-x-sebin",
  "omega-x-taedong",
  "omega-x-xen",
]);
const directoryCharacters = characterList.filter(
  (character) => character.id === "enemy-seungri" || (
    !mythicCharacterIds.has(character.id) && !HIDDEN_DIRECTORY_CHARACTER_IDS.has(character.id)
  ),
);

function FactionCta({faction, label, stopPropagation = false}: {faction: Faction; label: string; stopPropagation?: boolean}) {
  const {withBaseUrl} = useBaseUrlUtils();
  const href = getPublicFactionHref(faction.id);
  if (!href) return null;

  return (
    <Link
      className={styles.sectionCta}
      to={withBaseUrl(href)}
      onClick={stopPropagation ? (event) => event.stopPropagation() : undefined}
      onMouseDown={stopPropagation ? (event) => event.stopPropagation() : undefined}
    >
      {label} <span className={styles.arrow}>→</span>
    </Link>
  );
}

export default function CharactersPage() {
  const {withBaseUrl} = useBaseUrlUtils();

  const partyGroups = useMemo(() => {
    return sortByExplicitOrderThenTitle(
      factionList.filter((faction) => faction.type === "party"),
    ).map((faction) => ({
      faction,
      characters: sortByExplicitOrderThenTitle(
        directoryCharacters.filter((character) =>
          getRootFactionById(character.factionId ?? character.additionalFactionIds?.[0])?.id === faction.id,
        ),
      ),
    })).filter((group) => group.characters.length > 0);
  }, [directoryCharacters]);

  const realmSections = useMemo(() => {
    const realms = new Map<string, Map<string, CharacterGroup>>();

    for (const character of directoryCharacters) {
      const faction = getRootFactionById(character.factionId ?? character.additionalFactionIds?.[0]);
      if (faction?.type === "party") continue;

      const assignedRealm = faction?.realm ?? faction?.regionId ?? character.regionId;
      const realmId = !assignedRealm || ["sin-reino", "no-aplica"].includes(assignedRealm)
        ? NO_REALM_GROUP_ID
        : assignedRealm;
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
            characters: group.faction
              ? sortFactionCharacters(group.characters, group.faction)
              : sortByExplicitOrderThenTitle(group.characters),
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
          const docPath =
            getMythicEntityByCharacterId(character.id)?.docPath ?? getCharacterDocPath(character);
          const href = character.hasProfile === false ? undefined : withBaseUrl(`/${docPath}`);
          const isDeceased = character.status === "dead";
          const isFormerMember = character.membershipStatus === "former";
          const isMuted = isDeceased || isFormerMember;
          const statblock = getStatblock(character.id);
          const classEntries = statblock?.classes ?? [];

          const card = (
              <article
                className={`${styles.card} ${isMuted ? styles.cardMuted : ""}`}
              >
                <div className={styles.imageWrap}>
                  {imageUrl ? (
                    <img
                      className={`${styles.image} ${isMuted ? styles.imageMuted : ""}`}
                      src={imageUrl}
                      alt={character.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className={`${styles.imageFallback} ${isMuted ? styles.imageMuted : ""}`} aria-hidden="true">
                      <span className={styles.fallbackMark}>✦</span>
                    </div>
                  )}
                  {isMuted ? (
                    <div className={styles.statusBadges}>
                      {isFormerMember ? <span className={styles.statusBadge}>Ex-Miembro</span> : null}
                      {isDeceased ? <span className={styles.statusBadge}>✝ Fallecido</span> : null}
                    </div>
                  ) : null}
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
                </div>
              </article>
          );

          return href ? (
            <Link
              key={character.id}
              to={href}
              className={styles.cardLink}
              aria-label={`Abrir ficha de ${character.title}`}
            >
              {card}
            </Link>
          ) : (
            <div key={character.id} className={`${styles.cardLink} ${styles.cardStatic}`}>
              {card}
            </div>
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

          {partyGroups.map(({faction: featuredFaction, characters: featuredCharacters}) => (
            <details key={featuredFaction.id} className={styles.section} open>
              <summary className={styles.sectionHeader}>
                <div className={styles.sectionHeading}>
                  <div className={styles.sectionEyebrow}>
                    Party
                  </div>
                  <Heading as="h2" className={styles.sectionTitle}>
                    {featuredFaction.title}
                    <span className={styles.count}>{featuredCharacters.length}</span>
                  </Heading>
                </div>
                <div className={styles.sectionActions}>
                  <FactionCta faction={featuredFaction} label="Ver party" stopPropagation />
                  <span className={styles.chevron} aria-hidden="true" />
                </div>
              </summary>
              <div className={styles.sectionBody}>
                {renderCharacterGrid(featuredCharacters)}
              </div>
            </details>
          ))}

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
                        </div>
                        {group.faction ? <FactionCta faction={group.faction} label="Ver facción" /> : null}
                      </header>
                      {renderCharacterGrid(group.characters)}
                    </section>
                  );
                })}
              </div>
            </details>
          ))}
          <MysteryCards />
        </div>
      </main>
    </WikiSidebarPageLayout>
  );
}
