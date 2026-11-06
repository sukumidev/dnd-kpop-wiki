import React, {useRef, useState} from "react";
import Link from "@docusaurus/Link";
import {useBaseUrlUtils} from "@docusaurus/useBaseUrl";
import {getCharacterById, getCharacterDocPath} from "@site/src/data/characters";
import styles from "./ProtagonistCards.module.css";

type ProtagonistCard = {
  id: string;
  name: string;
  imageFile: string;
};

// These are landing-specific illustrations; character profile portraits stay in characters.json.
const protagonistCards = [
  {id: "pc-minjae", name: "Minjae", imageFile: "minjae-card.webp"},
  {id: "pc-kao", name: "Kao", imageFile: "kao-card.webp"},
  {id: "pc-kiyori", name: "Kiyori", imageFile: "kiyori-card.webp"},
  {id: "pc-imugi", name: "Imugi", imageFile: "Imugi-card.webp"},
  {id: "pc-soobin", name: "Soobin", imageFile: "soobin-card.webp"},
  
] as const satisfies readonly ProtagonistCard[];

function CardImage({name, src}: {name: string; src: string}) {
  const [failed, setFailed] = useState(false);

  return (
    <span className={styles.imageArea}>
      {failed ? (
        <span className={styles.pendingImage} aria-hidden="true">Ilustración pendiente</span>
      ) : (
        <img
          className={styles.image}
          src={src}
          alt={`Carta ilustrada de ${name}`}
          width="600"
          height="900"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

export default function ProtagonistCards(): React.ReactElement {
  const {withBaseUrl} = useBaseUrlUtils();
  const touchStartX = useRef(0);
  const touchWasDragged = useRef(false);

  return (
    <section className={styles.section} aria-labelledby="protagonists-title">
      <div className={styles.heading}>
        <h2 id="protagonists-title" className={styles.eyebrow}>Los Elegidos</h2>
        <div className={styles.ornament} aria-hidden="true"><span>✦</span><i /><span>✦</span></div>
        <h3 className={styles.title}>LOS PANES DEL DESTINO</h3>
        <p className={styles.subtitle}>Cinco destinos entrelazados en una historia aún por escribir.</p>
      </div>

      <div className={styles.track} aria-label="Cartas de los protagonistas">
        {protagonistCards.map(({id, name, imageFile}) => {
          const character = getCharacterById(id);
          if (!character) throw new Error(`Personaje de portada no encontrado: ${id}`);

          return (
            <Link
              key={id}
              className={styles.card}
              to={`/${getCharacterDocPath(character)}`}
              aria-label={`Abrir ficha de ${name}`}
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
              <CardImage name={name} src={withBaseUrl(`/img/characters/party/cards/${imageFile}`)} />
              <span className={styles.name}>{name}</span>
            </Link>
          );
        })}
      </div>
      <p className={styles.swipeHint} aria-hidden="true">Desliza para descubrir más <span>→</span></p>
    </section>
  );
}
