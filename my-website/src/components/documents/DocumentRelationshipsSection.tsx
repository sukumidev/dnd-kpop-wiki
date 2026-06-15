import React from "react";
import Link from "@docusaurus/Link";
import {
  getDocumentRelationships,
  type Document,
  type DocumentCharacterRelationRole,
} from "@site/src/data/documents";
import {
  getCharacterDocPath,
  type Character,
  type Faction,
  type Location,
  type Quest,
} from "@site/src/data/relationships";
import styles from "@site/src/pages/documents/styles.module.css";

const CHARACTER_ROLE_LABELS: Record<DocumentCharacterRelationRole, string> = {
  author: "Autor/a",
  recipient: "Destinatario/a",
  related: "Relacionado",
};

type RelatedEntity = Character | Quest | Faction | Location;

type RelationshipGroupProps<T extends RelatedEntity> = {
  title: string;
  items: T[];
  getHref: (item: T) => string;
  getBadge?: (item: T) => string | undefined | null;
  getText?: (item: T) => string | undefined | null;
};

function getDefaultText(entity: RelatedEntity): string | undefined {
  return entity.subtitle ?? entity.summary ?? undefined;
}

function RelationshipGroup<T extends RelatedEntity>({
  title,
  items,
  getHref,
  getBadge,
  getText = getDefaultText,
}: RelationshipGroupProps<T>): React.ReactElement | null {
  if (!items.length) return null;

  return (
    <section className={styles.relationshipGroup}>
      <h3 className={styles.relationshipSubtitle}>{title}</h3>
      <div className={styles.relatedList}>
        {items.map((item) => {
          const badge = getBadge?.(item);
          const text = getText(item);

          return (
            <Link key={item.id} className={styles.relatedLink} to={getHref(item)}>
              <article className={styles.relatedCard}>
                {badge ? (
                  <div className={styles.relatedHeader}>
                    <span className={styles.roleBadge}>{badge}</span>
                  </div>
                ) : null}
                <h4 className={styles.relatedItemTitle}>{item.title}</h4>
                {text ? <p className={styles.relatedText}>{text}</p> : null}
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function DocumentRelationshipsSection({
  document,
}: {
  document: Document;
}): React.ReactElement | null {
  const relationships = getDocumentRelationships(document);
  const hasRelationships =
    relationships.characters.length > 0 ||
    relationships.quests.length > 0 ||
    relationships.factions.length > 0 ||
    relationships.locations.length > 0;

  if (!hasRelationships) return null;

  return (
    <section
      className={styles.relationshipSection}
      aria-labelledby={`document-relationships-${document.id}`}
    >
      <h2 id={`document-relationships-${document.id}`} className={styles.relationshipTitle}>
        Relaciones
      </h2>

      {relationships.characters.length ? (
        <section className={styles.relationshipGroup}>
          <h3 className={styles.relationshipSubtitle}>Personajes relacionados</h3>
          <div className={styles.relatedList}>
            {relationships.characters.map(({ character, relationRole }) => (
              <Link
                key={`${document.id}-${character.id}`}
                className={styles.relatedLink}
                to={`/${getCharacterDocPath(character)}`}
              >
                <article className={styles.relatedCard}>
                  <div className={styles.relatedHeader}>
                    <span className={styles.roleBadge}>
                      {CHARACTER_ROLE_LABELS[relationRole]}
                    </span>
                    {character.status ? (
                      <span className={styles.roleBadge}>{character.status}</span>
                    ) : null}
                  </div>

                  <h4 className={styles.relatedItemTitle}>{character.title}</h4>
                  {character.subtitle ? (
                    <p className={styles.relatedText}>{character.subtitle}</p>
                  ) : null}
                </article>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <RelationshipGroup
        title="Quests relacionadas"
        items={relationships.quests}
        getHref={() => "/quests"}
        getBadge={(quest) => quest.status}
      />
      <RelationshipGroup
        title="Facciones relacionadas"
        items={relationships.factions}
        getHref={(faction) => `/factions/${faction.id}`}
        getBadge={(faction) => faction.type ?? faction.status}
        getText={(faction) => faction.summary ?? faction.goal ?? faction.subtitle}
      />
      <RelationshipGroup
        title="Lugares relacionados"
        items={relationships.locations}
        getHref={(location) => `/world/locations/${location.id}`}
        getBadge={(location) => location.type ?? location.status}
      />
    </section>
  );
}
