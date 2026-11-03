import React from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { publicMysteries } from "@site/src/data/publicMysteries";

/**
 * Explicitly approved mystery cards, not a filtered view of hidden characters.
 * No private IDs or undisclosed character metadata are sent to the browser.
 */
function MysteryCard({ mystery }: { mystery: (typeof publicMysteries)[number] }) {
  const image = useBaseUrl(mystery.imageSrc ?? "/");
  return (
    <Link to={"/mysteries/" + mystery.slug} style={{display:"block",padding:"1.25rem",border:"1px solid var(--ifm-color-emphasis-300)",borderRadius:12,textDecoration:"none",color:"inherit"}}>
      {mystery.imageSrc ? <img src={image} alt="" style={{width:"100%",height:160,objectFit:"cover",borderRadius:8}} loading="lazy" /> : <div aria-hidden="true" style={{fontSize:48,textAlign:"center",opacity:0.6}}>✦</div>}
      <h3 style={{marginTop:"0.75rem"}}>{mystery.title}</h3>
      <p>{mystery.teaser}</p>
      <small>Identidad desconocida</small>
    </Link>
  );
}

export default function MysteryCards(): React.ReactElement | null {
  if (!publicMysteries.length) return null;
  return (
    <section aria-labelledby="public-mysteries-heading" style={{margin:"2rem 0"}}>
      <h2 id="public-mysteries-heading">✦ Figuras misteriosas</h2>
      <p>Registros de identidad desconocida revelados por el narrador.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:16}}>
        {publicMysteries.map((mystery) => <MysteryCard key={mystery.slug} mystery={mystery} />)}
      </div>
    </section>
  );
}
