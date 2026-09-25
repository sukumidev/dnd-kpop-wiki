import React, {type ReactNode, useState} from 'react';
import Layout from '@theme/Layout';
import DocSidebar from '@theme/DocSidebar';
import {DocsSidebarProvider} from '@docusaurus/plugin-content-docs/client';
import {useLocation} from '@docusaurus/router';
import type {PropSidebar} from '@docusaurus/plugin-content-docs';
import SidebarRail from './SidebarRail';
import {getSessionHref, sessionList} from '@site/src/data/sessions';
import styles from './WikiSidebarPageLayout.module.css';

const link = (label: string, href: string) => ({
  type: 'link' as const,
  label,
  href,
});

const category = (
  label: string,
  items: PropSidebar,
  collapsed = true,
) => ({
  type: 'category' as const,
  label,
  collapsed,
  collapsible: true,
  items,
});

// Keep this resolved navigation aligned with sidebars.ts. Custom pages are not
// part of the docs route tree, so Docusaurus does not provide sidebar props.
const wikiSidebar: PropSidebar = [
  link('Start Here', '/'),
  link('Personajes', '/characters'),
  link('Cosmología', '/cosmology'),
  category('World', [
    category('Realms', [
      link('Hyberia', '/world/realms/hyberia'),
      link('Jeyperia', '/world/realms/jeyperia'),
      link('Sylmorien', '/world/realms/sylmorien'),
      link('Yggdrasil', '/world/realms/ygdrassil'),
    ]),
    category('Locations', [link('Isla Estelar', '/world/locations/isla-estelar')]),
    link('Timeline', '/world/timeline'),
  ]),
  category('Campaign', [
    category('Sessions', [
      link('Crónica de sesiones', '/sessions'),
      ...sessionList.map((session) =>
        link(`Sesión ${String(session.number).padStart(2, '0')}`, getSessionHref(session)),
      ),
    ]),
    category('Arcs', [link('Acto 1', '/campaign/arcs/acto-1')]),
  ]),
  link('Facciones', '/factions'),
  link('Documentos', '/documents'),
  category('Mecánicas', [link('Índice general', '/mechanics/')]),
  category('Sistemas y Objetos', [link('Deck of Fate', '/systems/deck-of-fate')]),
  category('Calendario', [link('Calendario', '/calendar/')]),
  category('Índices', [link('Glosario', '/indexes/glossary')]),
];

type Props = {
  children: ReactNode;
  title: string;
  description: string;
};

export default function WikiSidebarPageLayout({
  children,
  title,
  description,
}: Props) {
  const {pathname} = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout title={title} description={description}>
      <DocsSidebarProvider name="wiki" items={wikiSidebar}>
        <div className={styles.pageWithSidebar}>
          <aside
            className={`theme-doc-sidebar-container ${styles.sidebarContainer} ${collapsed ? styles.sidebarContainerCollapsed : ''}`}
            data-sidebar-state={collapsed ? 'collapsed' : 'expanded'}>
            <div className={styles.sidebarViewport}>
              {collapsed ? (
                <SidebarRail
                  sidebar={wikiSidebar}
                  path={pathname}
                  onExpand={() => setCollapsed(false)}
                />
              ) : (
                <DocSidebar
                  sidebar={wikiSidebar}
                  path={pathname}
                  onCollapse={() => setCollapsed(true)}
                  isHidden={false}
                />
              )}
            </div>
          </aside>
          <div className={styles.pageContent}>{children}</div>
        </div>
      </DocsSidebarProvider>
    </Layout>
  );
}
