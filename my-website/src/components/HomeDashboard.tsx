import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import Link from "@docusaurus/Link";

import CompactQuestDashboard, {getActiveQuestCount} from "./CompactQuestDashboard";
import {campaignSnapshot, exploreSections, tableTools} from "@site/src/data/home";
import {
  getSessionHref,
  getSessionStartingLocation,
  sessionList,
  type Session,
} from "@site/src/data/sessions";
import styles from "./HomeDashboard.module.css";

function getRecentSessions(): Session[] {
  return [...sessionList].sort((a, b) => b.number - a.number).slice(0, 3);
}

function TableTools() {
  return (
    <section className={styles.toolsSection} aria-labelledby="table-tools-title">
      <h2 id="table-tools-title" className={styles.utilityHeading}>Herramientas de mesa</h2>
      <div className={styles.toolList}>
        {tableTools.map((tool) => (
          <a
            className={styles.toolCard}
            href={tool.href}
            key={tool.name}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={styles.toolIcon} aria-hidden="true">{tool.icon}</span>
            <span>{tool.name}</span>
            <span className={styles.externalMark} aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function CampaignStatus() {
  const latestSession = useMemo(
    () => [...sessionList].sort((a, b) => b.number - a.number)[0],
    [],
  );
  const sessionNumber = campaignSnapshot.sessionNumber ?? latestSession?.number;
  const campaignDate = campaignSnapshot.campaignDate ?? latestSession?.campaignDate;
  const location = campaignSnapshot.location ?? (latestSession ? getSessionStartingLocation(latestSession) : undefined);
  const latestHref = campaignSnapshot.latestSessionHref ?? (latestSession ? getSessionHref(latestSession) : "/sessions");

  return (
    <aside className={styles.statusPanel} aria-labelledby="campaign-status-title">
      <div className={styles.statusHeadingRow}>
        <span className={styles.statusSigil} aria-hidden="true">✦</span>
        <h2 id="campaign-status-title" className={styles.utilityHeading}>Estado actual</h2>
      </div>
      <dl className={styles.statusList}>
        <div>
          <dt>Sesión</dt>
          <dd>{sessionNumber ?? "Sin registrar"}</dd>
        </div>
        <div>
          <dt>Fecha en campaña</dt>
          <dd>{campaignDate ?? "Sin registrar"}</dd>
        </div>
        <div>
          <dt>Ubicación</dt>
          <dd>{location ?? "Sin registrar"}</dd>
        </div>
        <div>
          <dt>Quests activas</dt>
          <dd>{getActiveQuestCount()}</dd>
        </div>
      </dl>
      <Link className={styles.sessionLink} to={latestHref}>
        {sessionNumber ? `Ver Sesión ${sessionNumber}` : "Ver sesiones"} <span aria-hidden="true">→</span>
      </Link>
    </aside>
  );
}

function ExploreCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(true);

  const updateControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollBack(track.scrollLeft > 4);
    setCanScrollForward(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateControls();
    const observer = new ResizeObserver(updateControls);
    observer.observe(track);
    return () => observer.disconnect();
  }, [updateControls]);

  const scroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({left: direction * Math.max(track.clientWidth * 0.8, 280), behavior: "smooth"});
  };

  return (
    <section className={styles.exploreSection} aria-labelledby="explore-title">
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.sectionKicker}>Abre el atlas</span>
          <h2 id="explore-title" className={styles.sectionTitle}>Explorar Hallyura</h2>
        </div>
        <div className={styles.carouselControls} aria-label="Controles del carrusel">
          <button type="button" onClick={() => scroll(-1)} disabled={!canScrollBack} aria-label="Ver secciones anteriores">←</button>
          <button type="button" onClick={() => scroll(1)} disabled={!canScrollForward} aria-label="Ver secciones siguientes">→</button>
        </div>
      </div>

      <div className={styles.carouselTrack} ref={trackRef} onScroll={updateControls}>
        {exploreSections.map((section) => (
          <Link className={styles.exploreCard} to={section.href} key={section.title}>
            <img
              className={styles.exploreImage}
              src={section.imageSrc}
              alt=""
              loading="lazy"
              style={{objectPosition: section.imagePosition ?? "center"}}
            />
            <span className={styles.exploreOverlay} aria-hidden="true" />
            <span className={styles.exploreContent}>
              <span className={styles.exploreTitle}>{section.title}</span>
              <span className={styles.exploreDescription}>{section.description}</span>
              <span className={styles.exploreCta}>Explorar <span aria-hidden="true">→</span></span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RecentActivity() {
  const recentSessions = getRecentSessions();

  return (
    <section className={styles.recentSection} aria-labelledby="recent-title">
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.sectionKicker}>Continúa leyendo</span>
          <h2 id="recent-title" className={styles.sectionTitle}>Actividad reciente</h2>
        </div>
        <Link className={styles.mutedLink} to="/sessions">Ver crónica completa →</Link>
      </div>

      <h3 className={styles.recentSubtitle}>Últimas sesiones</h3>
      {recentSessions.length ? (
        <div className={styles.recentList}>
          {recentSessions.map((session) => (
            <Link className={styles.recentCard} to={getSessionHref(session)} key={session.id}>
              <span className={styles.sessionNumber}>{String(session.number).padStart(2, "0")}</span>
              <span>
                <strong>Sesión {session.number}</strong>
                <small>{session.title}</small>
              </span>
              <span className={styles.recentArrow} aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.emptyState}>Todavía no hay sesiones publicadas.</p>
      )}
    </section>
  );
}

export default function HomeDashboard(): React.ReactElement {
  return (
    <div className={`${styles.homeDashboard} hallyura-home-dashboard`}>
      <TableTools />
      <div className={styles.campaignGrid}>
        <CompactQuestDashboard />
        <CampaignStatus />
      </div>
      <ExploreCarousel />
      <RecentActivity />
    </div>
  );
}
