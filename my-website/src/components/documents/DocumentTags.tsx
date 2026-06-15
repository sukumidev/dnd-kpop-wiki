import React from "react";
import styles from "@site/src/pages/documents/styles.module.css";

type DocumentTagsProps = {
  documentId: string;
  tags?: string[];
};

export default function DocumentTags({
  documentId,
  tags,
}: DocumentTagsProps): React.ReactElement | null {
  if (!tags?.length) return null;

  return (
    <div className={styles.tags} aria-label="Etiquetas">
      {tags.map((tag) => (
        <span key={`${documentId}-${tag}`} className={styles.tag}>
          #{tag}
        </span>
      ))}
    </div>
  );
}
