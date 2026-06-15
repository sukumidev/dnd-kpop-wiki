import React from 'react';
import factions from '@site/src/data/factions.json';
import Infobox from '@site/src/components/Infobox';
import RelatedDocumentsSection from '@site/src/components/documents/RelatedDocumentsSection';
import { factionJsonToSections } from '@site/src/utils/infoboxJson';
import { useDoc } from '@docusaurus/plugin-content-docs/client';

export default function FactionPageFromDoc({ children }: { children: React.ReactNode }) {
  const doc = useDoc();
  const factionId = (doc?.frontMatter as any)?.factionId as string | undefined;
  const data = factionId ? (factions as any)[factionId] : null;

  return (
    <>
      <Infobox
        title={data?.title ?? doc?.metadata?.title ?? 'Facción'}
        subtitle={data?.subtitle}
        imageSrc={data?.imageSrc}
        caption={data?.caption}
        sections={data ? factionJsonToSections(data) : []}
      />
      {children}
      {factionId ? <RelatedDocumentsSection factionId={factionId} /> : null}
    </>
  );
}
