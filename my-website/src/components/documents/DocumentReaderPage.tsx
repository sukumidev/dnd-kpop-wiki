import React from "react";
import Link from "@docusaurus/Link";
import { useLocation } from "@docusaurus/router";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import {
  getDocumentPath,
  getPublicChildDocuments,
  getPublicDocumentById,
  getPublicParentDocument,
  isDocumentCollection,
  isDocumentEntry,
  type Document,
} from "@site/src/data/documents";
import {
  getCharacterById,
  getCharacterDocPath,
} from "@site/src/data/relationships";
import DocumentTags from "./DocumentTags";
import DocumentTypeBadge from "./DocumentTypeBadge";
import DocumentEntryNavigation from "./DocumentEntryNavigation";
import DocumentRelationshipsSection from "./DocumentRelationshipsSection";
import styles from "@site/src/pages/documents/styles.module.css";

type DocumentReaderPageProps = {
  documentId?: string;
};

type MetaItem = {
  label: string;
  value: React.ReactNode;
};

function getDocumentIdFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  return decodeURIComponent(segments[segments.length - 1] ?? "");
}

function resolveCharacterLink(id: string): React.ReactNode {
  const character = getCharacterById(id);

  if (!character) return id;

  return <Link to={`/${getCharacterDocPath(character)}`}>{character.title}</Link>;
}

function Metadata({ document }: { document: Document }) {
  const author = document.authorCharacterId
    ? resolveCharacterLink(document.authorCharacterId)
    : document.authorName;

  const recipients = (document.recipientCharacterIds ?? []).map((id, index) => (
    <React.Fragment key={id}>
      {index > 0 ? ", " : null}
      {resolveCharacterLink(id)}
    </React.Fragment>
  ));

  const items: MetaItem[] = [
    document.inWorldDate ? { label: "Fecha en mundo", value: document.inWorldDate } : undefined,
    author ? { label: "Autor", value: author } : undefined,
    document.recipientCharacterIds?.length
      ? { label: "Destinatarios", value: recipients }
      : undefined,
  ].filter(Boolean) as MetaItem[];

  if (!items.length && !document.tags?.length) return null;

  return (
    <section className={styles.metaGrid} aria-label="Metadatos del documento">
      {items.map((item) => (
        <div key={item.label} className={styles.metaCard}>
          <div className={styles.metaLabel}>{item.label}</div>
          <p className={styles.metaValue}>{item.value}</p>
        </div>
      ))}

      {document.tags?.length ? (
        <div className={styles.metaCard}>
          <div className={styles.metaLabel}>Tags</div>
          <DocumentTags documentId={document.id} tags={document.tags} />
        </div>
      ) : null}
    </section>
  );
}

function DocumentHeader({
  document,
  eyebrow,
}: {
  document: Document;
  eyebrow?: React.ReactNode;
}) {
  const displayedDate = document.dateLabel ?? document.inWorldDate;

  return (
    <header className={styles.readerHeader}>
      <div className={styles.readerKicker}>
        <DocumentTypeBadge type={document.type} />
        {displayedDate ? <span className={styles.dateLabel}>{displayedDate}</span> : null}
      </div>

      {eyebrow ? <div className={styles.readerEyebrow}>{eyebrow}</div> : null}

      <h1 className={styles.readerTitle}>{document.title}</h1>
      {document.chapterTitle ? (
        <p className={styles.chapterLine}>
          {document.chapterNumber ? `Capitulo ${document.chapterNumber}: ` : null}
          {document.chapterTitle}
        </p>
      ) : null}
      {document.subtitle ? <p className={styles.readerSubtitle}>{document.subtitle}</p> : null}
    </header>
  );
}

function DocumentBody({ document }: { document: Document }) {
  const summary = document.summary || document.excerpt;

  return (
    <section className={styles.bodySection}>
      {summary ? <p className={styles.summaryBlock}>{summary}</p> : null}
      {document.content ? (
        <div className={styles.content}>{document.content}</div>
      ) : (
        <p className={styles.content}>Este documento no tiene contenido público todavía.</p>
      )}
    </section>
  );
}

function EntryMarker({ document }: { document: Document }) {
  const marker = document.chapterNumber ?? document.order;

  if (marker === undefined) return <span className={styles.entryMarker}>Entrada</span>;
  return <span className={styles.entryMarker}>{marker}</span>;
}

function CollectionEntryList({ collection }: { collection: Document }) {
  const entries = getPublicChildDocuments(collection.id);

  if (!entries.length) {
    return (
      <section className={styles.entryListSection}>
        <h2 className={styles.relationshipTitle}>Entradas</h2>
        <div className={styles.collectionEmpty}>
          No hay entradas publicas en esta colección todavía.
        </div>
      </section>
    );
  }

  return (
    <section className={styles.entryListSection}>
      <h2 className={styles.relationshipTitle}>Entradas</h2>
      <div className={styles.entryList}>
        {entries.map((entry) => {
          const teaser = entry.excerpt || entry.summary;
          const entryTitle = entry.chapterTitle || entry.title;

          return (
            <Link
              key={entry.id}
              className={styles.entryLink}
              to={getDocumentPath(entry)}
              aria-label={`Abrir entrada ${entryTitle}`}
            >
              <article className={styles.entryCard}>
                <EntryMarker document={entry} />
                <div className={styles.entryBody}>
                  <div className={styles.entryTopline}>
                    <h3 className={styles.entryTitle}>{entryTitle}</h3>
                    {entry.dateLabel ? (
                      <span className={styles.dateLabel}>{entry.dateLabel}</span>
                    ) : null}
                  </div>
                  {entry.chapterTitle && entry.title !== entry.chapterTitle ? (
                    <p className={styles.entryParentTitle}>{entry.title}</p>
                  ) : null}
                  {teaser ? <p className={styles.entryTeaser}>{teaser}</p> : null}
                  <DocumentTags documentId={entry.id} tags={entry.tags} />
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function UnavailableDocument() {
  return (
    <Layout title="Documento no disponible" description="Documento no disponible">
      <main className={styles.page}>
        <div className="container">
          <div className={styles.reader}>
            <Link className={styles.backLink} to="/documents">
              ← Volver a Documentos
            </Link>

            <section className={styles.emptyState}>
              <h1>Documento no disponible</h1>
              <p>
                No existe un documento público publicado para esta dirección, o el documento no
                está disponible para lectura pública.
              </p>
            </section>
          </div>
        </div>
      </main>
    </Layout>
  );
}

function CollectionPage({ document }: { document: Document }) {
  const summary = document?.summary || document?.excerpt;

  return (
    <Layout title={document.title} description={summary ?? "Colección de documentos"}>
      <main className={styles.page}>
        <div className="container">
          <article className={styles.reader}>
            <Link className={styles.backLink} to="/documents">
              ← Volver a Documentos
            </Link>
            <DocumentHeader document={document} eyebrow="Colección" />
            <Metadata document={document} />
            {summary ? (
              <section className={styles.bodySection}>
                <p className={styles.summaryBlock}>{summary}</p>
              </section>
            ) : null}
            <DocumentRelationshipsSection document={document} />
            <CollectionEntryList collection={document} />
          </article>
        </div>
      </main>
    </Layout>
  );
}

function ReaderPage({ document }: { document: Document }) {
  const { withBaseUrl } = useBaseUrlUtils();
  const summary = document.summary || document.excerpt;
  const publicParent = isDocumentEntry(document)
    ? getPublicParentDocument(document)
    : undefined;
  const entryEyebrow = isDocumentEntry(document) ? (
    publicParent ? (
      <>
        Entrada de{" "}
        <Link to={withBaseUrl(getDocumentPath(publicParent))}>{publicParent.title}</Link>
      </>
    ) : (
      "Colección no disponible"
    )
  ) : undefined;

  return (
    <Layout title={document.title} description={summary ?? "Documento de la campaña"}>
      <main className={styles.page}>
        <div className="container">
          <article className={styles.reader}>
            <Link className={styles.backLink} to={withBaseUrl("/documents")}>
              ← Volver a Documentos
            </Link>

            <DocumentHeader document={document} eyebrow={entryEyebrow} />

            <Metadata document={document} />
            <DocumentBody document={document} />

            {isDocumentEntry(document) ? <DocumentEntryNavigation document={document} /> : null}
            <DocumentRelationshipsSection document={document} />

          </article>
        </div>
      </main>
    </Layout>
  );
}

export default function DocumentReaderPage({
  documentId,
}: DocumentReaderPageProps = {}): React.ReactElement {
  const location = useLocation();
  const document = getPublicDocumentById(documentId ?? getDocumentIdFromPath(location.pathname));

  if (!document) {
    return <UnavailableDocument />;
  }

  if (isDocumentCollection(document)) {
    return <CollectionPage document={document} />;
  }

  return <ReaderPage document={document} />;
}
