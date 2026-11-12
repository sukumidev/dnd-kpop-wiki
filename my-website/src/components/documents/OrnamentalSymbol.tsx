import React from "react";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import { ARCHIVE_SYMBOLS, getOrnamentSymbol } from "@site/src/data/archiveSymbols";
import styles from "./OrnamentalSymbol.module.css";

/** Shared renderer for every physical archive object and frame. */
export default function OrnamentalSymbol({ value, className }: { value: string; className?: string }): React.ReactElement {
  const { withBaseUrl } = useBaseUrlUtils();
  const definition = getOrnamentSymbol(value);
  return (
    <span className={[styles.symbol, className].filter(Boolean).join(" ")} data-symbol={definition?.value ?? "fallback"} title={definition?.label ?? "Símbolo ornamental"}>
      {definition?.asset
        ? <span className={styles.vector} style={{ "--symbol-mask": `url("${withBaseUrl(definition.asset)}")` } as React.CSSProperties} />
        : definition?.value ?? ARCHIVE_SYMBOLS.star}
    </span>
  );
}
