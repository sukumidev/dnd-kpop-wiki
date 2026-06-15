import React from "react";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import Infobox from "@site/src/components/Infobox";
import RelatedDocumentsSection from "@site/src/components/documents/RelatedDocumentsSection";
import locations from "@site/src/data/locations.json";
import { locationJsonToSections } from "@site/src/utils/infoboxJson";

export default function LocationPageFromDoc({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const doc = useDoc();
  const locationId = (doc?.frontMatter as any)?.locationId as string | undefined;
  const data = locationId ? (locations as any)[locationId] : null;

  return (
    <>
      <Infobox
        title={data?.title ?? doc?.metadata?.title ?? "Lugar"}
        subtitle={data?.subtitle}
        imageSrc={data?.imageSrc}
        caption={data?.caption}
        sections={data ? locationJsonToSections(data) : []}
      />
      {children}
      {locationId ? <RelatedDocumentsSection locationId={locationId} /> : null}
    </>
  );
}
