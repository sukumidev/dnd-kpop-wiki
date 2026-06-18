import React, { useMemo } from "react";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import styles from "../characters/styles.module.css";

import {
  factionList,
  getFactionBase,
  getFactionLeader,
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

const OTHER_GROUP_ID = "otros";
const REGION_ORDER = ["hyberia", "sylmorien", "jeyperia", "yggdrasil"];
const REGION_DOC_PATHS: Record<string, string> = {
  hyberia: "/world/realms/hyberia",
  jeyperia: "/world/realms/jeyperia",
  sylmorien: "/world/realms/sylmorien",
  yggdrasil: "/world/realms/ygdrassil",
};

const factionTypeLabels: Record<string, string> = {
  academy: "Academia",
  alliance: "Alianza",
  clan: "Clan",
  enemy: "Enemigos",
  guild: "Gremio",
  kingdom: "Reino",
  order: "Orden",
  other: "Otra",
  pack: "Manada",
  party: "Party",
  pirates: "Piratas",
};

const factionStatusLabels: Record<string, string> = {
  active: "Activa",
  archived: "Archivada",
  disbanded: "Disuelta",
  destroyed: "Destruida",
  hidden: "Archivada",
  inactive: "Inactiva",
  unknown: "Estado desconocido",
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
  const realmId = normalizeRealmId(faction.realm) ?? faction.regionId ?? OTHER_GROUP_ID;
  const region = getLocationById(realmId);

  return {
    id: region?.id ?? realmId,
    title: faction.realm ?? region?.title ?? "Otros",
    region,
  };
}

function getFactionCaption(faction: Faction) {
  const region = getLocationById(faction.regionId);
  const base = getFactionBase(faction);
  const leader = getFactionLeader(faction);
  const type = faction.type ? factionTypeLabels[faction.type] ?? faction.type : null;
  const status = factionStatusLabels[faction.status] ?? faction.status;

  const context = [type, status].filter(Boolean).join(" - ");
  const place = faction.baseLabel ?? base?.title ?? region?.title ?? faction.realm;

  if (leader?.title && place) {
    return `${context} - ${place} - Lidera ${leader.title}`;
  }

  if (place) {
    return context ? `${context} - ${place}` : place;
  }

  return context || "Otros";
}

export default function FactionsPage() {
  const { withBaseUrl } = useBaseUrlUtils();

  const groupedFactions = useMemo(() => {
    return factionList
      .filter((faction) => !isArchivedFaction(faction))
      .reduce<Record<string, FactionGroup>>((groups, faction) => {
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
      }, {});
  }, []);

  const sections = useMemo(() => {
    return Object.entries(groupedFactions)
      .map(([id, group]) => ({ id, ...group }))
      .sort((a, b) => {
        if (a.id === OTHER_GROUP_ID) return 1;
        if (b.id === OTHER_GROUP_ID) return -1;

        const aOrder = REGION_ORDER.includes(a.id)
          ? REGION_ORDER.indexOf(a.id)
          : Number.MAX_SAFE_INTEGER;
        const bOrder = REGION_ORDER.includes(b.id)
          ? REGION_ORDER.indexOf(b.id)
          : Number.MAX_SAFE_INTEGER;

        if (aOrder !== bOrder) return aOrder - bOrder;
        return (a.region?.title ?? a.id).localeCompare(b.region?.title ?? b.id);
      });
  }, [groupedFactions]);

  return (
    <Layout title="Facciones" description="Facciones del universo">
      <main className={styles.page}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Todas las facciones</h1>
          </div>

          {sections.map((section) => {
            const sectionTitle = section.title;
            const regionPath = REGION_DOC_PATHS[section.realmId];

            return (
              <details key={section.id} className={styles.section} open>
                <summary className={styles.sectionHeader}>
                  <Heading as="h2" className={styles.sectionTitle}>
                    {sectionTitle}
                  </Heading>

                  <div className={styles.sectionActions}>
                    {regionPath ? (
                      <Link
                        className={styles.sectionCta}
                        to={withBaseUrl(regionPath)}
                        onClick={(event) => event.stopPropagation()}
                        onMouseDown={(event) => event.stopPropagation()}
                      >
                        Ver region <span className={styles.arrow}>-&gt;</span>
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
                      const captionText = getFactionCaption(faction);

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
                            <div className={styles.cardTop}>
                              <div className={styles.cardName}>
                                {faction.title}
                              </div>
                            </div>

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
                                      Destruida
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
                              {faction.subtitle ? (
                                <div className={styles.subtitle}>
                                  {faction.subtitle}
                                </div>
                              ) : null}
                              {captionText ? (
                                <div className={styles.caption}>
                                  {captionText}
                                </div>
                              ) : null}
                              {memberCount > 0 ? (
                                <div className={styles.caption}>
                                  {memberCount} miembros registrados
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
