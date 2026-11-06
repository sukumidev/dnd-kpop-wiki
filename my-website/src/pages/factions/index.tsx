import React, { useMemo } from "react";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import WikiSidebarPageLayout from "@site/src/components/WikiSidebarPageLayout";
import {
  PARTY_GROUP_ID,
  groupAndSortFactions,
} from "@site/src/utils/factionDirectoryOrdering";
import styles from "../characters/styles.module.css";

import {
  factionList,
  getFactionMembers,
  getFactionImageSources,
  type Faction,
  type Character,
} from "@site/src/data/relationships";
import {getPublicFactionHref, getPublicRealmHref} from "@site/src/data/publicRoutes";
import {useImageFallback} from "@site/src/hooks/useImageFallback";

function isArchivedFaction(faction: Faction) {
  return faction.status === "hidden" || String(faction.status) === "archived";
}

function FactionCardImage({faction, members}: {faction: Faction; members: Character[]}) {
  const {withBaseUrl} = useBaseUrlUtils();
  const {imageSrc, onError} = useImageFallback(getFactionImageSources(faction, members));
  const isDestroyed = faction.status === "destroyed";

  return (
    <div className={styles.imageWrap}>
      {imageSrc ? (
        <img
          className={`${styles.image} ${isDestroyed ? styles.imageMuted : ""}`}
          src={withBaseUrl(imageSrc)}
          alt={faction.title}
          loading="lazy"
          onError={onError}
        />
      ) : (
        <div className={`${styles.imageFallback} ${isDestroyed ? styles.imageMuted : ""}`} aria-hidden="true">
          <span className={styles.fallbackMark}>✦</span>
        </div>
      )}
      {isDestroyed ? (
        <div className={styles.statusBadges}>
          <span className={styles.statusBadge}>✦ Destruida</span>
        </div>
      ) : null}
    </div>
  );
}

export default function FactionsPage() {
  const { withBaseUrl } = useBaseUrlUtils();
  const directoryFactions = useMemo(
    () => factionList.filter((faction) => !isArchivedFaction(faction)),
    [],
  );

  const sections = useMemo(
    () => groupAndSortFactions(directoryFactions),
    [directoryFactions],
  );

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
            const regionPath = section.id === PARTY_GROUP_ID
              ? null
              : getPublicRealmHref(section.id);

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
                      const members = getFactionMembers(faction.id);
                      const memberCount = members.length;
                      const isDestroyed = faction.status === "destroyed";
                      const factionHref = getPublicFactionHref(faction.id);

                      const card = (
                          <article
                            className={`${styles.card} ${
                              isDestroyed ? styles.cardMuted : ""
                            }`}
                          >
                            <FactionCardImage faction={faction} members={members} />

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
                      );

                      return factionHref ? (
                        <Link
                          key={faction.id}
                          to={withBaseUrl(factionHref)}
                          className={styles.cardLink}
                          aria-label={`Abrir ficha de ${faction.title}`}
                        >
                          {card}
                        </Link>
                      ) : <div key={faction.id}>{card}</div>;
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
