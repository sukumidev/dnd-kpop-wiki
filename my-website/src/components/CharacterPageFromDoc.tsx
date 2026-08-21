import React from "react";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import CharacterPage from "./CharacterPage";

export function CharacterIntroduction({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function CharacterPageFromDoc({ children }: { children: React.ReactNode }) {
  const doc = useDoc();
  const id = (doc.frontMatter as any).characterId as string | undefined;

  const content = React.Children.toArray(children);
  const introductionIndex = content.findIndex(
    (child) => React.isValidElement(child) && child.type === CharacterIntroduction,
  );
  const introduction =
    introductionIndex >= 0 && React.isValidElement<{ children?: React.ReactNode }>(content[introductionIndex])
      ? content[introductionIndex].props.children
      : null;
  const body = introductionIndex >= 0
    ? content.filter((_, index) => index !== introductionIndex)
    : content;

  if (!id) {
    return (
      <div>
        <p>Falta <code>characterId</code> en el frontmatter 😭</p>
        {children}
      </div>
    );
  }

  return (
    <CharacterPage id={id} introduction={introduction}>
      {body}
    </CharacterPage>
  );
}
