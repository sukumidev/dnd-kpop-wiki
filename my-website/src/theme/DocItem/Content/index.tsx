import React, {type ReactNode} from "react";
import clsx from "clsx";
import {ThemeClassNames} from "@docusaurus/theme-common";
import {useDoc} from "@docusaurus/plugin-content-docs/client";
import Heading from "@theme/Heading";
import MDXContent from "@theme/MDXContent";
import SessionPageHeader from "@site/src/components/SessionPageHeader";
import {getSessionByDocId} from "@site/src/data/sessions";
import type {Props} from "@theme/DocItem/Content";

function useSyntheticTitle(): string | null {
  const {metadata, frontMatter, contentTitle} = useDoc();
  return !frontMatter.hide_title && typeof contentTitle === "undefined"
    ? metadata.title
    : null;
}

export default function DocItemContent({children}: Props): ReactNode {
  const {metadata} = useDoc();
  const session = getSessionByDocId(metadata.id);
  const syntheticTitle = useSyntheticTitle();

  return (
    <div className={clsx(ThemeClassNames.docs.docMarkdown, "markdown")}>
      {session ? (
        <SessionPageHeader session={session} />
      ) : syntheticTitle ? (
        <header>
          <Heading as="h1">{syntheticTitle}</Heading>
        </header>
      ) : null}
      <MDXContent>{children}</MDXContent>
    </div>
  );
}
