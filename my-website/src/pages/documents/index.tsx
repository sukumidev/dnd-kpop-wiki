import React, { useMemo, useState } from "react";
import Layout from "@theme/Layout";
import DocumentCard from "@site/src/components/documents/DocumentCard";
import {
  DOCUMENT_TYPES,
  filterDocumentsByType,
  getDocumentTypeLabel,
  getPublicTopLevelDocuments,
  isDocumentCollection,
  isStandaloneDocument,
  publicIndexDocuments,
  searchDocuments,
  type Document,
  type DocumentType,
} from "@site/src/data/documents";
import styles from "./styles.module.css";

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon} aria-hidden="true">
        Archivo
      </div>
      <h2>No hay documentos publicos todavia</h2>
      <p>
        Cuando el CMS exporte documentos publicados como publicos, apareceran en este archivo.
      </p>
    </div>
  );
}

function NoMatchesState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon} aria-hidden="true">
        Filtros
      </div>
      <h2>No hay documentos que coincidan</h2>
      <p>Prueba con otro texto o tipo para volver a explorar el archivo.</p>
    </div>
  );
}

function getTypeOptions(documents: Document[]): DocumentType[] {
  const availableTypes = new Set(documents.map((document) => document.type));
  return DOCUMENT_TYPES.filter((type) => availableTypes.has(type));
}

function DocumentGroup({
  title,
  description,
  documents,
}: {
  title: string;
  description: string;
  documents: Document[];
}) {
  if (!documents.length) return null;

  return (
    <section className={styles.indexSection} aria-labelledby={`${title}-title`}>
      <div className={styles.sectionHeading}>
        <div>
          <h2 id={`${title}-title`} className={styles.sectionTitle}>
            {title}
          </h2>
          <p className={styles.sectionDescription}>{description}</p>
        </div>
        <span className={styles.sectionCount}>{documents.length}</span>
      </div>

      <div className={styles.grid}>
        {documents.map((document) => (
          <DocumentCard key={document.id} document={document} />
        ))}
      </div>
    </section>
  );
}

export default function DocumentsPage(): React.ReactElement {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocumentType | "all">("all");

  const topLevelDocuments = useMemo(() => getPublicTopLevelDocuments(), []);
  const typeOptions = useMemo(() => getTypeOptions(topLevelDocuments), [topLevelDocuments]);
  const filteredDocuments = useMemo(() => {
    return searchDocuments(filterDocumentsByType(topLevelDocuments, typeFilter), query);
  }, [query, topLevelDocuments, typeFilter]);

  const collections = filteredDocuments.filter(isDocumentCollection);
  const standaloneDocuments = filteredDocuments.filter(isStandaloneDocument);
  const hasPublicDocuments = publicIndexDocuments.length > 0;
  const hasFilteredDocuments = filteredDocuments.length > 0;

  return (
    <Layout
      title="Documentos"
      description="Archivo publico de cartas, notas, libros y documentos de la campana"
    >
      <main className={styles.page}>
        <div className="container">
          <header className={styles.pageHeader}>
            <div className={styles.pageEyebrow}>Archivo de la campana</div>
            <div className={styles.headerRow}>
              <div>
                <h1 className={styles.pageTitle}>Documentos</h1>
                <p className={styles.pageSubtitle}>
                  Cartas, notas, libros, reportes, periodicos, decretos y handouts
                  encontrados durante la aventura. Las entradas de colecciones se leen desde
                  su coleccion para mantener este indice limpio.
                </p>
              </div>
              <div className={styles.countBadge}>
                {publicIndexDocuments.length}{" "}
                {publicIndexDocuments.length === 1 ? "documento" : "documentos"}
              </div>
            </div>
          </header>

          {hasPublicDocuments ? (
            <>
              <section className={styles.filters} aria-label="Filtros de documentos">
                <label className={styles.filterField}>
                  <span>Buscar</span>
                  <input
                    className={styles.filterInput}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Titulo o resumen"
                  />
                </label>

                <label className={styles.filterField}>
                  <span>Tipo</span>
                  <select
                    className={styles.filterInput}
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value as DocumentType | "all")}
                  >
                    <option value="all">Todos</option>
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>
                        {getDocumentTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </label>
              </section>

              {hasFilteredDocuments ? (
                <>
                  <DocumentGroup
                    title="Colecciones"
                    description="Diarios, libros y archivos que agrupan entradas o capitulos."
                    documents={collections}
                  />
                  <DocumentGroup
                    title="Documentos sueltos"
                    description="Cartas, notas, reportes, periodicos, decretos y handouts publicados."
                    documents={standaloneDocuments}
                  />
                </>
              ) : (
                <NoMatchesState />
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </main>
    </Layout>
  );
}
