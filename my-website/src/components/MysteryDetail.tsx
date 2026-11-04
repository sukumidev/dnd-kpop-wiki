import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { getPublicMystery } from "@site/src/data/publicMysteries";

export default function MysteryDetail({ slug }: { slug: string }): React.ReactElement {
  const mystery = getPublicMystery(slug);
  const image = useBaseUrl(mystery?.imageSrc ?? "/");
  if (!mystery) {
    return <Layout title="Misterio no disponible"><main className="container margin-vert--lg"><h1>Misterio no disponible</h1><Link to="/characters">Volver a personajes</Link></main></Layout>;
  }
  return (
    <Layout title={mystery.title} description={mystery.teaser}>
      <main className="container margin-vert--lg" style={{maxWidth: 760}}>
        <p style={{letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.65}}>✦ Archivo de lo desconocido</p>
        <h1>{mystery.title}</h1>
        {mystery.imageSrc ? (
          <img src={image} alt="" loading="lazy" style={{width:"100%",maxHeight:440,objectFit:"cover",borderRadius:12}} />
        ) : <div aria-hidden="true" style={{fontSize:72, opacity:0.5, margin:"1rem 0"}}>✦</div>}
        <p>{mystery.teaser}</p>
        <Link to="/characters">← Volver al directorio</Link>
      </main>
    </Layout>
  );
}
