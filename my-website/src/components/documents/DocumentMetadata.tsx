import React from "react";
import Link from "@docusaurus/Link";
import {getDocumentCharacterRelations, type Document} from "@site/src/data/documents";
import {getCharacterDocPath, type Character} from "@site/src/data/relationships";
import styles from "@site/src/pages/documents/styles.module.css";

function CharacterLinks({characters}: {characters: Character[]}) {
  return <>{characters.map((character, index) => (
    <React.Fragment key={character.id}>
      {index ? <span aria-hidden="true"> · </span> : null}
      <Link to={`/${getCharacterDocPath(character)}`}>{character.title}</Link>
    </React.Fragment>
  ))}</>;
}

export default function DocumentMetadata({document}: {document: Document}) {
  const {authors, recipients} = getDocumentCharacterRelations(document);
  const author = authors.length ? <CharacterLinks characters={authors} /> : document.authorName || null;
  const items = [
    document.inWorldDate ? {label: "Fecha", value: document.inWorldDate, emphasis: document.type === "diary"} : undefined,
    author ? {label: "Autor", value: author, emphasis: document.type === "letter"} : undefined,
    recipients.length ? {label: recipients.length === 1 ? "Destinatario" : "Destinatarios", value: <CharacterLinks characters={recipients} />, emphasis: document.type === "letter"} : undefined,
    document.dateLabel ? {label: "Registro", value: document.dateLabel, emphasis: false} : undefined,
  ].filter(Boolean) as {label: string; value: React.ReactNode; emphasis: boolean}[];
  if (!items.length) return null;
  return (
    <dl className={styles.metadata} aria-label="Metadatos del documento">
      {items.map((item) => <div className={item.emphasis ? styles.metadataItemEmphasis : styles.metadataItem} key={item.label}>
        <dt>{item.label}</dt><dd>{item.value}</dd>
      </div>)}
    </dl>
  );
}
