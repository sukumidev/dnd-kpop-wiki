import React, {useMemo} from "react";
import Heading from "@theme/Heading";
import Link from "@docusaurus/Link";
import {useBaseUrlUtils} from "@docusaurus/useBaseUrl";
import WikiSidebarPageLayout from "@site/src/components/WikiSidebarPageLayout";
import {
  mythicEntityList,
  type MythicEntity,
} from "@site/src/data/cosmology";
import styles from "./styles.module.css";

type PantheonGroup = {
  title: string;
  entities: MythicEntity[];
};

const OTHER_PANTHEON = "Otros";

function EntityCard({entity}: {entity: MythicEntity}) {
  const {withBaseUrl} = useBaseUrlUtils();
  const imageUrl = entity.imageSrc ? withBaseUrl(entity.imageSrc) : undefined;

  const content = (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        {imageUrl ? (
          <img
            className={styles.image}
            src={imageUrl}
            alt={entity.title}
            loading="lazy"
          />
        ) : (
          <div className={styles.imageFallback} aria-hidden="true">
            <span className={styles.fallbackMark}>✦</span>
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <Heading as="h3" className={styles.cardTitle}>
          {entity.title}
        </Heading>
        {entity.subtitle ? (
          <div className={styles.subtitle}>{entity.subtitle}</div>
        ) : null}
        {entity.summary ? (
          <p className={styles.summary}>{entity.summary}</p>
        ) : null}
      </div>
    </article>
  );

  return entity.docPath ? (
    <Link
      to={withBaseUrl(`/${entity.docPath}`)}
      className={styles.cardLink}
      aria-label={`Abrir ficha de ${entity.title}`}
    >
      {content}
    </Link>
  ) : (
    <div className={styles.cardLink}>{content}</div>
  );
}

export default function CosmologyPage() {
  const pantheons = useMemo(() => {
    const groups = mythicEntityList.reduce<Record<string, PantheonGroup>>(
      (result, entity) => {
        const title = entity.pantheon?.trim() || OTHER_PANTHEON;
        result[title] ??= {title, entities: []};
        result[title].entities.push(entity);
        return result;
      },
      {},
    );

    return Object.values(groups).sort((a, b) => {
      if (a.title === OTHER_PANTHEON) return 1;
      if (b.title === OTHER_PANTHEON) return -1;
      return a.title.localeCompare(b.title, "es");
    });
  }, []);

  return (
    <WikiSidebarPageLayout
      title="Cosmología"
      description="Entidades, dioses y fuerzas mitológicas del universo"
    >
      <main className={styles.page}>
        <div className="container">
          <header className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <div className={styles.kicker}>Archivo de lo divino</div>
              <h1 className={styles.pageTitle}>Cosmología</h1>
              <p className={styles.pageSubtitle}>
                Dioses, entidades y fuerzas organizados según el panteón al que pertenecen.
              </p>
            </div>
            <div
              className={styles.total}
              aria-label={`${mythicEntityList.length} entidades`}
            >
              <strong>{mythicEntityList.length}</strong>
              <span>entidades</span>
            </div>
          </header>

          {pantheons.map((pantheon) => (
            <details key={pantheon.title} className={styles.section} open>
              <summary className={styles.sectionHeader}>
                <div>
                  <div className={styles.sectionEyebrow}>Panteón</div>
                  <Heading as="h2" className={styles.sectionTitle}>
                    {pantheon.title}
                    <span className={styles.count}>{pantheon.entities.length}</span>
                  </Heading>
                  <p className={styles.sectionDescription}>
                    Entidades vinculadas a este panteón.
                  </p>
                </div>
                <span className={styles.chevron} aria-hidden="true" />
              </summary>

              <div className={styles.sectionBody}>
                <div className={styles.grid}>
                  {pantheon.entities.map((entity) => (
                    <EntityCard key={entity.id} entity={entity} />
                  ))}
                </div>
              </div>
            </details>
          ))}

          {!pantheons.length ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyGlyph}>✧</span>
              <span>Aún no hay panteones registrados.</span>
            </div>
          ) : null}
        </div>
      </main>
    </WikiSidebarPageLayout>
  );
}
