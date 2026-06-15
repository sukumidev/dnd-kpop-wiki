import React from "react";
import { getDocumentTypeLabel, type DocumentType } from "@site/src/data/documents";
import styles from "@site/src/pages/documents/styles.module.css";

type DocumentTypeBadgeProps = {
  type: DocumentType;
};

export default function DocumentTypeBadge({ type }: DocumentTypeBadgeProps): React.ReactElement {
  return (
    <span className={styles.typeBadge} data-document-type={type}>
      {getDocumentTypeLabel(type)}
    </span>
  );
}
