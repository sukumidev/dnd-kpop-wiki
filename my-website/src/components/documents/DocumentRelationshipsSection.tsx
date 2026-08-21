import React from "react";
import Link from "@docusaurus/Link";
import {getDocumentRelationships, type Document} from "@site/src/data/documents";
import {getCharacterDocPath, type Character} from "@site/src/data/relationships";
import styles from "@site/src/pages/documents/styles.module.css";

type RelationshipItem = {id: string; title: string};

function RelationshipRow({title, items, getHref}: {title: string; items: RelationshipItem[]; getHref: (item: RelationshipItem) => string}) {
  if (!items.length) return null;
  return <div className={styles.relationshipRow}><h3>{title}</h3><p>{items.map((item, index) => <React.Fragment key={item.id}>{index ? <span aria-hidden="true"> · </span> : null}<Link to={getHref(item)}>{item.title}</Link></React.Fragment>)}</p></div>;
}

export default function DocumentRelationshipsSection({document}: {document: Document}): React.ReactElement | null {
  const relationships = getDocumentRelationships(document);
  const relatedCharacters = relationships.characters.filter(({relationRole}) => relationRole === "related").map(({character}) => character);
  const hasRelationships = relatedCharacters.length || relationships.quests.length || relationships.factions.length || relationships.locations.length;
  if (!hasRelationships) return null;
  return (
    <section className={styles.relationshipSection} aria-labelledby={`document-relationships-${document.id}`}>
      <div className={styles.sectionHeadingEditorial}><span>Archivo vinculado</span><h2 id={`document-relationships-${document.id}`}>Relacionado</h2></div>
      <div className={styles.relationshipRows}>
        <RelationshipRow title="Personajes" items={relatedCharacters} getHref={(item) => `/${getCharacterDocPath(item as Character)}`} />
        <RelationshipRow title="Facciones" items={relationships.factions} getHref={(item) => `/factions/${item.id}`} />
        <RelationshipRow title="Lugares" items={relationships.locations} getHref={(item) => `/world/locations/${item.id}`} />
        <RelationshipRow title="Misiones" items={relationships.quests} getHref={() => "/quests"} />
      </div>
    </section>
  );
}
