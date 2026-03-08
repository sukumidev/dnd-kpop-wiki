import React, { useEffect, useMemo, useRef, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import charactersJson from "@site/src/data/characters.json";
import styles from "../css/CharacterImageCarousel.module.css";
import { useCharacterId } from "@site/src/components/CharacterContext";

type CarouselImage = { img: string; caption?: string };
type Character = { title?: string; images?: CarouselImage[] };
type CharactersMap = Record<string, Character>;

function joinBase(base: string, p: string) {
  // base suele ser "/wiki/" o "/"
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  if (!p) return b;
  return p.startsWith("/") ? `${b}${p}` : `${b}/${p}`;
}

export default function CharacterImageCarousel({
  id,
  title = "",
}: {
  id?: string;
  title?: string;
}) {
  // ✅ Hook siempre se llama
  const ctxId = useCharacterId();
  const finalId = id ?? ctxId ?? "";

  // ✅ Hook siempre se llama (una sola vez)
  const base = useBaseUrl("/"); // ej "/wiki/" o "/"

  // ✅ Hooks siempre se llaman, aunque no haya id
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const characters = charactersJson as CharactersMap;
  const c = finalId ? characters[finalId] : undefined;

  const slides = useMemo(() => {
    const imgs = (c?.images ?? []).filter((x) => x?.img);
    return imgs.map((x) => ({
      ...x,
      src: joinBase(base, x.img),
    }));
  }, [c, base]);

  // Mantener active sincronizado con scroll-snap
  useEffect(() => {
  const el = trackRef.current;
  if (!el) return;

  let raf = 0;

  const onScroll = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const step = getStep();
      if (!step) return;
      const i = Math.round(el.scrollLeft / step);
      setActive(Math.max(0, Math.min(i, slides.length - 1)));
    });
  };

  el.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    el.removeEventListener("scroll", onScroll as any);
    cancelAnimationFrame(raf);
  };
  // slides.length para que active se recalcule si cambia el set de imágenes
}, [slides.length]);

  // Si cambia el personaje, resetea el slide activo
  useEffect(() => {
    setActive(0);
    const el = trackRef.current;
    if (el) el.scrollTo({ left: 0 });
  }, [finalId]);

  const goTo = (idx: number) => {
  const el = trackRef.current;
  if (!el) return;

  const children = Array.from(el.children) as HTMLElement[];
  const target = children[idx];
  if (!target) return;

  target.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
};

const getStep = () => {
  const el = trackRef.current;
  if (!el) return 0;

  // ancho visible del carrusel
  const w = el.clientWidth;

  // intenta leer el gap real del grid (por si lo cambias en CSS)
  const cs = window.getComputedStyle(el);
  const gapStr = cs.getPropertyValue("gap") || cs.getPropertyValue("column-gap") || "0px";
  const gap = parseFloat(gapStr) || 0;

  return w + gap;
};

const goToIndex = (idx: number, behavior: ScrollBehavior = "smooth") => {
  const el = trackRef.current;
  if (!el) return;

  const step = getStep();
  if (!step) return;

  el.scrollTo({ left: idx * step, behavior });
};

const prev = () => {
  const el = trackRef.current;
  if (!el || !slides.length) return;

  const step = getStep();
  if (!step) return;

  // índice aproximado actual
  const i = Math.round(el.scrollLeft / step);

  if (i <= 0) {
    // wrap al final (instant)
    goToIndex(slides.length - 1, "auto");
  } else {
    goToIndex(i - 1, "smooth");
  }
};

const next = () => {
  const el = trackRef.current;
  if (!el || !slides.length) return;

  const step = getStep();
  if (!step) return;

  const i = Math.round(el.scrollLeft / step);

  if (i >= slides.length - 1) {
    // wrap al inicio (instant)
    goToIndex(0, "auto");
  } else {
    goToIndex(i + 1, "smooth");
  }
};  
  // ✅ Ahora sí: returns después de hooks
  if (!finalId || !slides.length) return null;

  return (
    <section className={styles.wrap} aria-label={`Carrusel de ${c?.title ?? finalId}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>

        <div className={styles.controls}>
          <button type="button" className={styles.navBtn} onClick={prev} aria-label="Imagen anterior">
  ←
</button>
<button type="button" className={styles.navBtn} onClick={next} aria-label="Siguiente imagen">
  →
</button>
        </div>
      </div>

      <div className={styles.track} ref={trackRef}>
        {slides.map((s, idx) => (
          <figure key={s.src + idx} className={styles.slide}>
            <div className={styles.media}>
  <img
    className={styles.img}
    src={s.src}
    alt={s.caption ?? `${c?.title ?? finalId} - imagen ${idx + 1}`}
    loading="lazy"
  />
</div>
            {s.caption ? <figcaption className={styles.caption}>{s.caption}</figcaption> : null}
          </figure>
        ))}
      </div>

      <div className={styles.dots} aria-label="Indicadores del carrusel">
        {slides.map((_s, idx) => (
          <button
            key={idx}
            type="button"
            className={idx === active ? styles.dotActive : styles.dot}
            onClick={() => goToIndex(idx, "smooth")}
            aria-label={`Ir a imagen ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}