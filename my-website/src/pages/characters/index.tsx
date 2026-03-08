import React, { useMemo } from "react";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

// Ajusta el path según dónde lo tengas:
import charactersJson from "@site/src/data/characters.json";

type Ref = { label: string; doc?: string };

type Character = {
  id?: string;

  title: string;
  subtitle?: string;

  // tu nuevo campo es imgSrc
  imageSrc?: string;

  caption?: string;

  faction?: Ref;
  realm?: Ref;

  group?: string;
  role?: string;

  occupation?: string[];
  status?: string;

  class?: string;
  subclass?: string;
  lvl?: number;

  // si quieres permitir override:
  doc?: string;
};

// El JSON está como objeto tipo { "svt-joshua": { ... } }
type CharactersMap = Record<string, Character>;

function groupBy<T>(items: Array<[string, T]>, getKey: (id: string, item: T) => string) {
  return items.reduce<Record<string, Array<[string, T]>>>((acc, [id, item]) => {
    const key = getKey(id, item) || "Otros";
    acc[key] ??= [];
    acc[key].push([id, item]);
    return acc;
  }, {});
}

function slugifyFolder(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolveCharacterDoc(id: string, c: Character) {
  if (c.doc) return c.doc;
  const group = c.group ?? "misc";
  return `characters/${group}/${id}`;
}

export default function CharactersPage() {
  const characters = charactersJson as CharactersMap;

  const entries = useMemo(() => Object.entries(characters), [characters]);

  // Agrupa por facción (label). Alternativa: c.caption
  const grouped = useMemo(() => {
    return groupBy(entries, (_id, c) => c.faction?.label || c.caption || "Otros");
  }, [entries]);

  // Orden opcional de secciones (las que no estén aquí se van al final)
  const sectionOrder = [
    "Los Panes del Destino",
    "Gremio de Aventureros",
    "Los Lobos Perdidos",
    "Los Hijos de la Noche",
    "Los Neo Culturales Tecnológicos",
    "Los Monstruos X",
  ];

  const sectionKeys = useMemo(() => {
    const keys = Object.keys(grouped);

    const ranked = keys
      .map((k) => ({ k, i: sectionOrder.indexOf(k) }))
      .sort((a, b) => {
        const ai = a.i === -1 ? Number.POSITIVE_INFINITY : a.i;
        const bi = b.i === -1 ? Number.POSITIVE_INFINITY : b.i;
        return ai - bi || a.k.localeCompare(b.k);
      })
      .map((x) => x.k);

    return ranked;
  }, [grouped]);

  return (
    <Layout title="Characters" description="Personajes del universo">
      <main className={styles.page}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Todos los personajes</h1>
          </div>
          {sectionKeys.map((section) => (
            <details key={section} className={styles.section} open>
  <summary className={styles.sectionHeader}>
    <Heading as="h2" className={styles.sectionTitle}>
      {section}
    </Heading>

    <div className={styles.sectionActions}>
      {grouped[section]?.[0]?.[1]?.faction?.doc ? (
        <Link
          className={styles.sectionCta}
          to={useBaseUrl(`/${grouped[section][0][1].faction!.doc}`)}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          Ver facción <span className={styles.arrow}>→</span>
        </Link>
      ) : null}

      <span className={styles.chevron} aria-hidden="true" />
    </div>
  </summary>

  <div className={styles.sectionBody}>
    <div className={styles.grid}>
      {grouped[section].map(([id, c]) => {
        const imgUrl = c.imageSrc ? useBaseUrl(c.imageSrc) : undefined;
        const docPath = resolveCharacterDoc(id, c);

        const factionLabel = c.faction?.label?.trim();
        const realmLabel = c.realm?.label?.trim();

        const captionText =
          factionLabel && realmLabel
            ? `${factionLabel} — ${realmLabel}`
            : factionLabel || realmLabel || undefined;

        return (
          <Link
            key={id}
            to={useBaseUrl(`/${docPath}`)}
            className={styles.cardLink}
            aria-label={`Abrir ficha de ${c.title}`}
          >
            <article className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.cardName}>{c.title}</div>
              </div>

              <div className={styles.imageWrap}>
                {imgUrl ? (
                  <img className={styles.image} src={imgUrl} alt={c.title} loading="lazy" />
                ) : (
                  <div className={styles.imageFallback}>No image</div>
                )}
              </div>

              <div className={styles.cardBottom}>
                {c.subtitle ? <div className={styles.subtitle}>{c.subtitle}</div> : null}
                {captionText ? <div className={styles.caption}>{captionText}</div> : null}
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  </div>
</details>
          ))}
        </div>
      </main>
    </Layout>
  );
}