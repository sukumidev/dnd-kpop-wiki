import React from "react";
import Link from "@docusaurus/Link";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import {
  getCharacterDocumentRelationRole,
  getDocumentKind,
  getDocumentPath,
  getPublicDocumentsForCharacter,
  getPublicDocumentsForFaction,
  getPublicDocumentsForLocation,
  getPublicDocumentsForQuest,
  getRelatedDocumentDisplayTarget,
  type Document,
  type DocumentCharacterRelationRole,
} from "@site/src/data/documents";
import DocumentTypeBadge from "./DocumentTypeBadge";
import DocumentTags from "./DocumentTags";
import styles from "@site/src/pages/documents/styles.module.css";

const ROLE_LABELS: Record<DocumentCharacterRelationRole, string> = {
  author: "Autor/a",
  recipient: "Destinatario/a",
  related: "Relacionado",
};

function getDocumentText(document: Document): string | undefined {
  return document.excerpt || document.summary;
}

function getKindLabel(document: Document): string | undefined {
  switch (getDocumentKind(document)) {
    case "collection":
      return "Colección";
    case "entry":
      return "Entrada";
    default:
      return undefined;
  }
}

function getRolePriority(role: DocumentCharacterRelationRole | undefined): number {
  switch (role) {
    case "author":
      return 3;
    case "recipient":
      return 2;
    case "related":
      return 1;
    default:
      return 0;
  }
}

function buildDisplayItems(
  documents: Document[],
  characterId?: string,
): {
  document: Document;
  relationRole?: DocumentCharacterRelationRole;
  includesCollapsedEntries: boolean;
}[] {
  const itemsByDocumentId = new Map<
    string,
    {
      document: Document;
      relationRole?: DocumentCharacterRelationRole;
      includesCollapsedEntries: boolean;
    }
  >();

  for (const document of documents) {
    const target = getRelatedDocumentDisplayTarget(document);
    if (!target) continue;

    const existing = itemsByDocumentId.get(target.id);
    const collapsedToParent = target.id !== document.id;
    const directTargetRole = characterId
      ? getCharacterDocumentRelationRole(target, characterId)
      : undefined;
    const relationRole = directTargetRole ?? (characterId && collapsedToParent ? "related" : undefined);
    const nextItem = existing ?? {
      document: target,
      relationRole: undefined,
      includesCollapsedEntries: false,
    };

    if (getRolePriority(relationRole) > getRolePriority(nextItem.relationRole)) {
      nextItem.relationRole = relationRole;
    }

    nextItem.includesCollapsedEntries =
      nextItem.includesCollapsedEntries || collapsedToParent;
    itemsByDocumentId.set(target.id, nextItem);
  }

  return [...itemsByDocumentId.values()].sort((a, b) =>
    a.document.title.localeCompare(b.document.title),
  );
}

export default function RelatedDocumentsSection({
  characterId,
  questId,
  factionId,
  locationId,
}: {
  characterId?: string;
  questId?: string;
  factionId?: string;
  locationId?: string;
}): React.ReactElement | null {
  const { withBaseUrl } = useBaseUrlUtils();
  const relatedDocuments = characterId
    ? getPublicDocumentsForCharacter(characterId)
    : questId
      ? getPublicDocumentsForQuest(questId)
      : factionId
        ? getPublicDocumentsForFaction(factionId)
        : locationId
          ? getPublicDocumentsForLocation(locationId)
          : [];
  const displayItems = buildDisplayItems(relatedDocuments, characterId);
  const sectionId = `related-documents-${characterId ?? questId ?? factionId ?? locationId ?? "section"}`;

  if (!displayItems.length) return null;

  return (
    <section className={styles.relatedSection} aria-labelledby={sectionId}>
      <h2 id={sectionId} className={styles.relatedTitle}>
        Documentos relacionados
      </h2>

      <div className={styles.relatedList}>
        {displayItems.map(({ document, relationRole, includesCollapsedEntries }) => {
          const text = getDocumentText(document);
          const kindLabel = getKindLabel(document);

          return (
            <Link
              key={document.id}
              className={styles.relatedLink}
              to={withBaseUrl(getDocumentPath(document))}
            >
              <article className={styles.relatedCard}>
                <div className={styles.relatedHeader}>
                  <DocumentTypeBadge type={document.type} />
                  {kindLabel ? <span className={styles.roleBadge}>{kindLabel}</span> : null}
                  {relationRole ? (
                    <span className={styles.roleBadge}>{ROLE_LABELS[relationRole]}</span>
                  ) : null}
                  {includesCollapsedEntries ? (
                    <span className={styles.roleBadge}>Coleccion relacionada</span>
                  ) : null}
                  {document.dateLabel ? (
                    <span className={styles.dateLabel}>{document.dateLabel}</span>
                  ) : null}
                </div>

                <h3 className={styles.relatedItemTitle}>{document.title}</h3>
                {text ? <p className={styles.relatedText}>{text}</p> : null}
                <DocumentTags documentId={document.id} tags={document.tags} />
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
