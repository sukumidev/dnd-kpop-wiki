import React from "react";
import Link from "@docusaurus/Link";
import {
  getSessionHref,
  getSessionsByCharacterId,
  getSessionsByLocationId,
  type Session,
} from "@site/src/data/sessions";
import styles from "./CampaignAppearancesSection.module.css";

type Props =
  | {characterId: string; locationId?: never}
  | {locationId: string; characterId?: never};

function formatSessionNumber(session: Session) {
  return Number.isInteger(session.number)
    ? String(session.number).padStart(2, "0")
    : String(session.number);
}

export default function CampaignAppearancesSection(props: Props) {
  const sessions = "characterId" in props
    ? getSessionsByCharacterId(props.characterId)
    : getSessionsByLocationId(props.locationId);

  if (!sessions.length) return null;

  return (
    <section className={styles.section}>
      <h2>Apariciones en campaña</h2>
      <ul className={styles.list}>
        {sessions.map((session) => (
          <li key={session.id}>
            <Link to={getSessionHref(session)}>
              Sesión {formatSessionNumber(session)} — {session.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
