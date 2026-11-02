import React from "react";
import Link from "@docusaurus/Link";
import {useDoc} from "@docusaurus/plugin-content-docs/client";
import CharacterSplitLayout from "@site/src/components/CharacterSplitLayout";
import Infobox, {type Section} from "@site/src/components/Infobox";
import {getMythicEntityById} from "@site/src/data/cosmology";
import {getFactionById} from "@site/src/data/relationships";
import {getPublicFactionHref} from "@site/src/data/publicRoutes";

export default function DeityPageFromDoc({children}: {children: React.ReactNode}) {
  const doc = useDoc();
  const deityId = (doc.frontMatter as {deityId?: string}).deityId;
  const deity = deityId ? getMythicEntityById(deityId) : undefined;

  if (!deity) {
    return <p>Falta una deidad válida en el campo <code>deityId</code>.</p>;
  }

  const faction = getFactionById(deity.factionId);
  const factionHref = getPublicFactionHref(faction?.id);
  const sections: Section[] = [{
    title: "Divinidad",
    rows: [
      {label: "Alineamiento principal", value: deity.alignment ?? "No establecido"},
      {
        label: "Panteón",
        value: factionHref && faction
          ? <Link to={factionHref}>{faction.title}</Link>
          : faction
          ? faction.title
          : deity.pantheon ?? "No establecido",
      },
      {label: "Culto", value: deity.cult ?? "No establecido"},
    ],
  }];

  return (
    <CharacterSplitLayout
      side={
        <Infobox
          title={deity.title}
          subtitle={deity.subtitle ?? undefined}
          imageSrc={deity.imageSrc ?? undefined}
          sections={sections}
        />
      }
    >
      {children}
    </CharacterSplitLayout>
  );
}
