import React, {useRef, useState} from "react";
import Link from "@docusaurus/Link";
import {useBaseUrlUtils} from "@docusaurus/useBaseUrl";
import {getLocationById} from "@site/src/data/locations";
import {getPublicRealmHref} from "@site/src/data/publicRoutes";
import styles from "./RealmGallery.module.css";

type RealmCard = {
  id: string;
  name: string;
  imageFile: string;
  description: string;
  glow: string;
};

// Descriptions and landing art are editorial choices; titles and routes come from the Wiki registry.
const realmCards = [
  {
    id: "hyberia",
    name: "Hyberia",
    imageFile: "hyberia.webp",
    description: "Un reino de campos fértiles y héroes olvidados, donde la esperanza sobrevive gracias a la unión de su pueblo.",
    glow: "rgba(54, 176, 126, 0.3)",
  },
  {
    id: "sylmorien",
    name: "Sylmorien",
    imageFile: "sylmorien.webp",
    description: "Un imperio de magia, disciplina y perfección, cuyo esplendor esconde una ambición implacable.",
    glow: "rgba(215, 177, 106, 0.28)",
  },
  {
    id: "jeyperia",
    name: "Jeyperia",
    imageFile: "jeyperia.webp",
    description: "Una tierra de honor y linajes nobles, donde los juramentos y las alianzas de sangre gobiernan el destino.",
    glow: "rgba(154, 210, 233, 0.3)",
  },
  {
    id: "yggdrasil",
    name: "Yggdrasil",
    imageFile: "ygdrassil.webp",
    description: "Los antiguos dominios del Árbol del Mundo, donde la magia, la naturaleza y la memoria permanecen entrelazadas.",
    glow: "rgba(117, 151, 240, 0.3)",
  },
  {
    id: "hotou",
    name: "Hotou",
    imageFile: "hotou.webp",
    description: "Un archipiélago de clanes, santuarios y tradiciones, donde los nombres familiares representan honor y deber.",
    glow: "rgba(220, 225, 235, 0.28)",
  },
  {
    id: "guozhong",
    name: "Guozhong",
    imageFile: "guozhong.webp",
    description: "Una tierra de montañas e islas flotantes, donde el recuerdo de los dragones persiste bajo el dominio imperial.",
    glow: "rgba(229, 204, 117, 0.28)",
  },
] as const satisfies readonly RealmCard[];

function RealmImage({name, src}: {name: string; src: string}) {
  const [failed, setFailed] = useState(false);

  return (
    <span className={styles.imageArea}>
      {failed ? (
        <span className={styles.pendingImage}>Ilustración pendiente</span>
      ) : (
        <img
          className={styles.image}
          src={src}
          alt={`Ilustración ornamental de ${name}`}
          width="640"
          height="640"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

export default function RealmGallery(): React.ReactElement {
  const {withBaseUrl} = useBaseUrlUtils();
  const touchStartX = useRef(0);
  const touchWasDragged = useRef(false);

  return (
    <section className={styles.section} aria-labelledby="realms-title">
      <header className={styles.heading}>
        <div className={styles.ornament} aria-hidden="true"><span>✦</span><i /><span>✦</span></div>
        <h2 id="realms-title" className={styles.title}>LOS REINOS DE HALLYURA</h2>
        <p className={styles.subtitle}>Un mundo marcado por la magia, la guerra y las decisiones de sus habitantes.</p>
      </header>

      <div className={styles.gallery} aria-label="Territorios de Hallyura">
        {realmCards.map(({id, name, imageFile, description, glow}) => {
          const location = getLocationById(id);
          const href = location?.visibility === "public" ? getPublicRealmHref(id) : undefined;
          const content = (
            <>
              <RealmImage name={location?.title ?? name} src={withBaseUrl(`/img/realms/${imageFile}`)} />
              <span className={styles.name}>{location?.title ?? name}</span>
              <span className={styles.description}>{description}</span>
              {!href && <span className={styles.pendingLink}>Ficha pendiente</span>}
            </>
          );

          return href ? (
            <Link
              key={id}
              className={styles.card}
              to={href}
              style={{"--realm-glow": glow} as React.CSSProperties}
              aria-label={`Explorar ${location?.title ?? name}`}
              onTouchStart={(event) => {
                touchStartX.current = event.touches[0]?.clientX ?? 0;
                touchWasDragged.current = false;
              }}
              onTouchMove={(event) => {
                if (Math.abs((event.touches[0]?.clientX ?? touchStartX.current) - touchStartX.current) > 8) {
                  touchWasDragged.current = true;
                }
              }}
              onClickCapture={(event) => {
                if (touchWasDragged.current) event.preventDefault();
              }}
            >
              {content}
            </Link>
          ) : (
            <article key={id} className={styles.card} style={{"--realm-glow": glow} as React.CSSProperties}>
              {content}
            </article>
          );
        })}
      </div>
      <p className={styles.swipeHint} aria-hidden="true">Desliza para explorar más <span>→</span></p>
    </section>
  );
}
