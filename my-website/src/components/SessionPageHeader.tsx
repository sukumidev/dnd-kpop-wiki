import React, {useState} from "react";
import Heading from "@theme/Heading";
import {useBaseUrlUtils} from "@docusaurus/useBaseUrl";
import {
  formatSessionDateLong,
  getSessionCover,
  getSessionLocations,
  type Session,
} from "@site/src/data/sessions";
import styles from "./SessionPageHeader.module.css";

type Props = {
  session: Session;
};

export default function SessionPageHeader({session}: Props) {
  const {withBaseUrl} = useBaseUrlUtils();
  const [imageFailed, setImageFailed] = useState(false);
  const cover = getSessionCover(session);
  const locations = getSessionLocations(session);
  const sessionLabel = `Sesión ${String(session.number).padStart(2, "0")}`;

  return (
    <header className={styles.header}>
      <div className={styles.coverFrame}>
        <div className={styles.fallback} aria-hidden="true">
          <span className={styles.fallbackRing} />
          <span className={styles.fallbackMark}>✦</span>
        </div>
        {cover && !imageFailed ? (
          <img
            className={styles.cover}
            src={withBaseUrl(cover)}
            alt=""
            aria-hidden="true"
            decoding="async"
            fetchPriority="high"
            style={{objectPosition: session.imagePosition ?? "center center"}}
            onError={() => setImageFailed(true)}
          />
        ) : null}
        <div className={styles.coverOverlay} aria-hidden="true" />
      </div>

      <div className={styles.headingBlock}>
        <div className={styles.eyebrow}>{sessionLabel}</div>
        <Heading as="h1" className={styles.title}>{session.title}</Heading>
      </div>

      <dl className={styles.infobox}>
        {session.sessionDate ? (
          <div className={styles.fact}>
            <dt>Fecha real</dt>
            <dd><time dateTime={session.sessionDate}>{formatSessionDateLong(session.sessionDate)}</time></dd>
          </div>
        ) : null}
        {session.campaignDate ? (
          <div className={styles.fact}>
            <dt>Fecha en campaña</dt>
            <dd>{session.campaignDate}</dd>
          </div>
        ) : null}
        {locations.length > 0 ? (
          <div className={styles.fact}>
            <dt>Lugares visitados</dt>
            <dd>
              <ul className={styles.locationList}>
                {locations.map((location) => <li key={location.id}>{location.title}</li>)}
              </ul>
            </dd>
          </div>
        ) : null}
      </dl>
    </header>
  );
}
