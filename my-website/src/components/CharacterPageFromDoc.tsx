import React from "react";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import CharacterPage from "./CharacterPage";

export default function CharacterPageFromDoc({ children }: { children: React.ReactNode }) {
  const doc = useDoc();
  const id = (doc.frontMatter as any).characterId as string | undefined;

  if (!id) {
    return (
      <div>
        <p>Falta <code>characterId</code> en el frontmatter 😭</p>
        {children}
      </div>
    );
  }

  return <CharacterPage id={id}>{children}</CharacterPage>;
}