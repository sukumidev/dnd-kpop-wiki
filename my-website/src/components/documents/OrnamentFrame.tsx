import React from "react";
import type { OrnamentFrameStyle } from "@site/src/data/library";
import OrnamentalSymbol from "./OrnamentalSymbol";
import styles from "./OrnamentFrame.module.css";

/** CMS frame geometry, kept separate from the chosen central symbol. */
export default function OrnamentFrame({ frame, symbol }: { frame: OrnamentFrameStyle; symbol: string }): React.ReactElement {
  return <span className={styles.frame} data-frame={frame}>
    {frame !== "none" ? <svg viewBox="0 0 64 64" focusable="false" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {frame === "circle" ? <><circle cx="32" cy="32" r="27" /><circle cx="32" cy="32" r="23" strokeWidth=".7" /></> : null}
      {frame === "diamond" ? <><path d="M32 3 61 32 32 61 3 32Z" /><path d="M32 9 55 32 32 55 9 32Z" strokeWidth=".7" /></> : null}
      {frame === "laurel-frame" ? <>
        <path d="M23 54C9 46 8 22 20 10M41 54c14-8 15-32 3-44" />
        <path d="M15 45c-6-2-8-6-8-10 5 0 9 3 10 6M13 33c-5-3-6-8-5-12 5 2 8 5 8 9M17 21c-2-5 0-9 3-12 3 4 3 8 0 12M49 45c6-2 8-6 8-10-5 0-9 3-10 6M51 33c5-3 6-8 5-12-5 2-8 5-8 9M47 21c2-5 0-9-3-12-3 4-3 8 0 12" strokeWidth="1" />
        <path d="M24 53q8 5 16 0" />
      </> : null}
      {frame === "arcane" ? <>
        <circle cx="32" cy="32" r="24" /><circle cx="32" cy="32" r="19" strokeWidth=".8" />
        <path d="M32 3v9M32 52v9M3 32h9M52 32h9M11 11l6 6M47 47l6 6M53 11l-6 6M17 47l-6 6" />
        <path d="m32 13 16 28H16Z" strokeWidth=".8" />
      </> : null}
      {frame === "filigree-frame" ? <>
        <path d="M32 4c-4 8-12 6-15 13-4 7 2 10 0 15-2 5-8 6-7 13 1 5 7 7 12 4M32 4c4 8 12 6 15 13 4 7-2 10 0 15 2 5 8 6 7 13-1 5-7 7-12 4M22 49c2 5 6 8 10 11 4-3 8-6 10-11" />
        <path d="M16 17c-5-4-7-1-7 2 0 3 4 5 7 2M48 17c5-4 7-1 7 2 0 3-4 5-7 2M18 40c-5-4-8 0-6 4M46 40c5-4 8 0 6 4M24 12q8 5 16 0" strokeWidth="1" />
        <circle cx="32" cy="7" r="1.5" fill="currentColor" stroke="none" />
      </> : null}
    </svg> : null}
    <OrnamentalSymbol value={symbol} className={styles.symbol} />
  </span>;
}
