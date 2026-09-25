import React, { useMemo } from "react";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import WikiSidebarPageLayout from "@site/src/components/WikiSidebarPageLayout";
import {
  NO_REALM_GROUP_ID,
  compareRealmGroups,
  sortFactionsByPriority,
  sortByExplicitOrderThenTitle,
} from "@site/src/utils/directoryOrdering";
import styles from "../characters/styles.module.css";

import {
  factionList,
  getFactionMembers,
  getLocationById,
  type Faction,
  type Location,
} from "@site/src/data/relationships";

type FactionGroup = {
  region?: Location;
  realmId: string;
  title: string;
  factions: Faction[];
};

const PARTY_GROUP_ID = "__parties__";

const REGION_DOC_PATHS: Record<string, string> = {
  hyberia: "/world/realms/hyberia",
  jeyperia: "/world/realms/jeyperia",
  sylmorien: "/world/realms/sylmorien",
  yggdrasil: "/world/realms/ygdrassil",
};

function isArchivedFaction(faction: Faction) {
  return faction.status === "hidden" || String(faction.status) === "archived";
}

function normalizeRealmId(realm?: string | null) {
  return realm
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getFactionRealm(faction: Faction) {
  if (faction.type === "party") {
    return { id: PARTY_GROUP_ID, title: "Parties", region: undefined };
  }

  const normalizedRealm = normalizeRealmId(faction.realm);
  const realmId =
    !normalizedRealm ||
    normalizedRealm === "no-aplica" ||
    normalizedRealm === "sin-reino"
      ? NO_REALM_GROUP_ID
      : normalizedRealm;
  const region = getLocationById(realmId);

  return {
    id: region?.id ?? realmId,
    title:
      realmId === NO_REALM_GROUP_ID
        ? "Sin reino"
        : region?.title ?? faction.realm ?? realmId,
    region,
  };
}

export default function FactionsPage() {
  const { withBaseUrl } = useBaseUrlUtils();
  const directoryFactions = useMemo(
    () => factionList.filter((faction) => !isArchivedFaction(faction)),
    [],
  );

  const groupedFactions = useMemo(() => {
    return directoryFactions.reduce<Record<string, FactionGroup>>(
      (groups, faction) => {
        const realm = getFactionRealm(faction);
        const groupKey = realm.id;

        groups[groupKey] ??= {
          region: realm.region,
          realmId: groupKey,
          title: realm.title,
          factions: [],
        };

        groups[groupKey].factions.push(faction);
        return groups;
      },
      {},
    );
  }, [directoryFactions]);

  const sections = useMemo(() => {
    return Object.entries(groupedFactions)
      .map(([id, group]) => ({
        id,
        ...group,
        factions: id === PARTY_GROUP_ID
          ? sortByExplicitOrderThenTitle(group.factions)
          : sortFactionsByPriority(group.factions),
      }))
      .sort((a, b) => {
        if (a.id === PARTY_GROUP_ID) return -1;
        if (b.id === PARTY_GROUP_ID) return 1;
        return compareRealmGroups(a, b);
      });
  }, [groupedFactions]);

  return (
    <WikiSidebarPageLayout title="Facciones" description="Facciones del universo">
      <main className={styles.page}>
        <div className="container">
          <header className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <div className={styles.kicker}>Atlas de poderes</div>
              <h1 className={styles.pageTitle}>Directorio de facciones</h1>
              <p className={styles.pageSubtitle}>
                Reinos, gremios, clanes y alianzas que disputan el destino de Hallyura.
              </p>
            </div>
            <div
              className={styles.total}
              aria-label={`${directoryFactions.length} facciones`}
            >
              <strong>{directoryFactions.length}</strong>
              <span>facciones</span>
            </div>
          </header>

          {sections.map((section) => {
            const sectionTitle = section.title;
            const regionPath = REGION_DOC_PATHS[section.realmId];

            return (
              <details key={section.id} className={styles.section} open>
                <summary className={styles.sectionHeader}>
                  <div className={styles.sectionHeading}>
                    <div className={styles.sectionEyebrow}>
                      {section.id === PARTY_GROUP_ID ? "Aventureros" : "Reino"}
                    </div>
                    <Heading as="h2" className={styles.sectionTitle}>
                      {sectionTitle}
                      <span className={styles.count}>{section.factions.length}</span>
                    </Heading>
                  </div>

                  <div className={styles.sectionActions}>
                    {regionPath ? (
                      <Link
                        className={styles.sectionCta}
                        to={withBaseUrl(regionPath)}
                        onClick={(event) => event.stopPropagation()}
                        onMouseDown={(event) => event.stopPropagation()}
                      >
                        Ver reino <span className={styles.arrow}>→</span>
                      </Link>
                    ) : null}

                    <span className={styles.chevron} aria-hidden="true" />
                  </div>
                </summary>

                <div className={styles.sectionBody}>
                  <div className={styles.grid}>
                    {section.factions.map((faction) => {
                      const imgUrl = faction.imageSrc
                        ? withBaseUrl(faction.imageSrc)
                        : undefined;
                      const memberCount = getFactionMembers(faction.id).length;
                      const isDestroyed = faction.status === "destroyed";

                      return (
                        <Link
                          key={faction.id}
                          to={withBaseUrl(`/factions/${faction.id}`)}
                          className={styles.cardLink}
                          aria-label={`Abrir ficha de ${faction.title}`}
                        >
                          <article
                            className={`${styles.card} ${
                              isDestroyed ? styles.cardDeceased : ""
                            }`}
                          >
                            <div className={styles.imageWrap}>
                              {imgUrl ? (
                                <>
                                  <img
                                    className={`${styles.image} ${
                                      isDestroyed ? styles.imageDeceased : ""
                                    }`}
                                    src={imgUrl}
                                    alt={faction.title}
                                    loading="lazy"
                                  />
                                  {isDestroyed ? (
                                    <div className={styles.deceasedBadge}>
                                      ✦ Destruida
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
                                {faction.title}
                              </Heading>
                              {faction.subtitle ? (
                                <div className={styles.subtitle}>
                                  {faction.subtitle}
                                </div>
                              ) : null}
                              {memberCount > 0 ? (
                                <div className={styles.classList} aria-label="Miembros">
                                  <span className={styles.classEntry}>
                                    <strong>{memberCount}</strong>
                                    <span>{memberCount === 1 ? "miembro" : "miembros"}</span>
                                  </span>
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
    </WikiSidebarPageLayout>
  );
}
