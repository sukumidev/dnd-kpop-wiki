// src/components/Infobox.tsx
import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export type Row = { label: string; value: React.ReactNode };
export type Section = { title: string; rows: Row[] };

type InfoboxProps = {
  title: string;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
  caption?: string;
  sections?: Section[];
  accentClass?: string;
};

export default function Infobox({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  caption,
  sections = [],           // 👈 IMPORTANT: default
  accentClass
}: InfoboxProps) {
  const imgUrl = imageSrc ? useBaseUrl(imageSrc) : undefined;

  return (
    <aside className="infobox" data-accent={accentClass}>
      <div className="infobox__header">
        <div className="infobox__title">{title}</div>
        {subtitle && <div className="infobox__subtitle">{subtitle}</div>}
      </div>

      {imgUrl ? (
        <figure className="infobox__figure">
          <img className="infobox__img" src={imgUrl} alt={imageAlt ?? title} loading="lazy" />
          {caption && <figcaption className="infobox__caption">{caption}</figcaption>}
        </figure>
      ) : null}

      {sections.map((section, sIdx) => (
        <div key={sIdx} className="infobox__section">
          <div className="infobox__sectionTitle">{section.title}</div>
          <table className="infobox__table">
            <tbody>
              {section.rows.map((r, idx) => (
                <tr key={idx}>
                  <th>{r.label}</th>
                  <td>{r.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </aside>
  );
}