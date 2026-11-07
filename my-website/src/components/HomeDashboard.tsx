import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import Link from "@docusaurus/Link";

import CompactQuestDashboard, {getActiveQuestCount} from "./CompactQuestDashboard";
import ProtagonistCards from "./ProtagonistCards";
import RealmGallery from "./RealmGallery";
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



function WorldIntro(): React.ReactElement {
  return (
    <section className={styles.worldIntro} aria-labelledby="world-intro-title">
      <span className={styles.narrativeKicker}>El mundo de Hallyura</span>
      <h2 id="world-intro-title" className={styles.narrativeTitle}>Bienvenido a Hallyura</h2>
      <p>
        Hallyura es un mundo de reinos poderosos, magia viva y leyendas que
        todavía respiran bajo la superficie. La Gran Guerra de la Tercera Era
        dejó ciudades heridas, fronteras tensas y cicatrices difíciles de sanar.
      </p>
      <p>
        Hoy, cada territorio conserva su propia memoria, sus costumbres y sus
        conflictos. Tras una paz frágil, sus habitantes siguen escribiendo
        nuevas historias.
      </p>
    </section>
  );
}

function WorldInMotion(): React.ReactElement {
  return (
    <section className={styles.worldSection} aria-labelledby="world-in-motion-title">
      <span className={styles.narrativeKicker}>Más allá de las fronteras</span>
      <h2 id="world-in-motion-title" className={styles.narrativeTitle}>Un mundo en movimiento</h2>
      <p>
        Tras la Gran Guerra de la Tercera Era, Hallyura vive una paz frágil.
        Reinos, clanes, gremios y órdenes mantienen alianzas y rivalidades
        que siguen dando forma a la vida de sus habitantes.
      </p>
      <p>
        Algunos buscan proteger a quienes fueron olvidados; otros desean
        recuperar lo que les fue arrebatado o extender su poder.
        En sus decisiones se escribe la historia de este mundo.
      </p>
      <Link className={styles.narrativeLink} to="/factions">
        Conocer las facciones <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

function DeckOfFateIntro(): React.ReactElement {
  return (
    <section className={styles.campaignSection} aria-labelledby="deck-of-fate-title">
      <span className={styles.narrativeKicker}>La aventura</span>
      <h2 id="deck-of-fate-title" className={styles.narrativeTitle}>Deck of Fate</h2>
      <div className={styles.campaignIntroGrid}>
        <div className={styles.campaignMain}>
          <div className={styles.campaignNarrative}>
            <p>
              En este mundo de magia antigua y reinos divididos, un grupo de
              aventureros busca las Cartas del Destino. Sus encuentros,
              decisiones y alianzas entrelazan historias que todavía están
              por escribirse.
            </p>
            <p>
              Conoce a quienes protagonizan esta aventura y sigue las
              crónicas de su viaje por Hallyura.
            </p>
            <Link className={styles.narrativeLink} to="/sessions">
              Leer las crónicas <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className={styles.campaignQuests}>
            <CompactQuestDashboard />
          </div>
        </div>
        <CampaignStatus />
      </div>
    </section>
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
      <WorldIntro />
      <RealmGallery />
      <WorldInMotion />
      <ProtagonistCards />
      <DeckOfFateIntro />
      <ExploreCarousel />
      <RecentActivity />
      <TableTools />
    </div>
  );
}
