import React, {useState} from "react";
import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";
import {useBaseUrlUtils} from "@docusaurus/useBaseUrl";
import type {CampaignSession} from "@site/src/data/sessions";
import {
  formatSessionDate,
  getSessionCover,
  getSessionHref,
  getSessionStartingLocation,
} from "@site/src/data/sessions";
import styles from "./SessionCard.module.css";

type Props = {
  session: CampaignSession;
};

export default function SessionCard({session}: Props) {
  const {withBaseUrl} = useBaseUrlUtils();
  const [imageFailed, setImageFailed] = useState(false);
  const cover = getSessionCover(session);
  const startingLocation = getSessionStartingLocation(session);
  const sessionLabel = `Sesión ${String(session.number).padStart(2, "0")}`;

  return (
    <Link
      to={withBaseUrl(getSessionHref(session))}
      className={styles.cardLink}
      aria-label={`Leer ${sessionLabel}: ${session.title}`}>
      <article className={styles.card}>
        <div className={styles.fallback} aria-hidden="true">
          <span className={styles.fallbackOrb} />
          <span className={styles.fallbackSigil}>✦</span>
        </div>

        {cover && !imageFailed ? (
          <img
            className={styles.cover}
            src={withBaseUrl(cover)}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            style={{objectPosition: session.imagePosition ?? "center center"}}
            onError={() => setImageFailed(true)}
          />
        ) : null}

        <div className={styles.scrim} aria-hidden="true" />

        <div className={styles.content}>
          <div className={styles.sessionNumber}>{sessionLabel}</div>
          <Heading as="h2" className={styles.title}>
            {session.title}
          </Heading>

          <div className={styles.metadata}>
            <div className={styles.dates}>
              {session.sessionDate ? (
                <time dateTime={session.sessionDate}>
                  {formatSessionDate(session.sessionDate)}
                </time>
              ) : null}
              {session.campaignDate ? (
                <>
                  {session.sessionDate ? (
                    <span className={styles.separator} aria-hidden="true">·</span>
                  ) : null}
                  <span>{session.campaignDate}</span>
                </>
              ) : null}
            </div>

            {startingLocation ? (
              <div className={styles.location}>
                <span className={styles.locationIcon} aria-hidden="true">⌖</span>
                <span className={styles.locationLead}>Inicia en</span>
                <span>{startingLocation}</span>
              </div>
            ) : null}
          </div>
        </div>

        <span className={styles.action} aria-hidden="true">
          Leer sesión <span>→</span>
        </span>
      </article>
    </Link>
  );
}
