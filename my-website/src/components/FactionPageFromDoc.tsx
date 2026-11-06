import React from 'react';
import {getFactionById, getFactionImageSources, getFactionMembers} from '@site/src/data/relationships';
import Infobox from '@site/src/components/Infobox';
import FactionMembersFromDoc from '@site/src/components/FactionMembersFromDoc';
import RelatedDocumentsSection from '@site/src/components/documents/RelatedDocumentsSection';
import { factionJsonToSections } from '@site/src/utils/infoboxJson';
import { useDoc } from '@docusaurus/plugin-content-docs/client';

export default function FactionPageFromDoc({ children }: { children: React.ReactNode }) {
  const doc = useDoc();
  const factionId = (doc?.frontMatter as any)?.factionId as string | undefined;
  const data = factionId ? getFactionById(factionId) : undefined;
  const imageSources = data ? getFactionImageSources(data, getFactionMembers(data.id)) : [];

  return (
    <>
      <Infobox
        title={data?.title ?? doc?.metadata?.title ?? 'Facción'}
        subtitle={data?.subtitle}
        imageSrc={data?.imageSrc ?? undefined}
        imageSources={imageSources}
        caption={data?.imageCaption}
        sections={data ? factionJsonToSections(data) : []}
      />
      {children}
      <FactionMembersFromDoc />
      {factionId ? <RelatedDocumentsSection factionId={factionId} /> : null}
    </>
  );
}
