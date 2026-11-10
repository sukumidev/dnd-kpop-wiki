import React, {type ReactNode, useState} from 'react';
import Layout from '@theme/Layout';
import DocSidebar from '@theme/DocSidebar';
import {DocsSidebarProvider} from '@docusaurus/plugin-content-docs/client';
import {useLocation} from '@docusaurus/router';
import type {PropSidebar} from '@docusaurus/plugin-content-docs';
import SidebarRail from './SidebarRail';
import {characterClasses, getCharacterClassHref} from '@site/src/data/characterClasses';
import styles from './WikiSidebarPageLayout.module.css';

const link = (label: string, href: string) => ({
  type: 'link' as const,
  label,
  href,
});

const category = (label: string, items: PropSidebar, href?: string) => ({
  type: 'category' as const,
  label,
  items,
  href,
  collapsed: true,
  collapsible: true,
});

// Custom pages do not receive Docusaurus's resolved docs sidebar.
// Mirror its section links here so navigation stays consistent across routes.
const wikiSidebar: PropSidebar = [
  link('Start Here', '/'),
  link('Personajes', '/characters'),
  link('Cosmología', '/cosmology'),
  category('World', [
    link('Índice de reinos', '/world'),
    category('Realms', [
      link('Hyberia', '/world/realms/hyberia'),
      link('Sylmorien', '/world/realms/sylmorien'),
      link('Jeyperia', '/world/realms/jeyperia'),
      link('Ygdrassil', '/world/realms/ygdrassil'),
      link('Hotou', '/world/realms/hotou'),
      link('Guozhong', '/world/realms/guozhong'),
    ]),
    category('Locations', [link('Isla Estelar', '/world/locations/isla-estelar')]),
    link('Timeline', '/world/timeline'),
  ], '/world'),
  category('Campaign', [
    link('Crónica de sesiones', '/sessions'),
    category('Sessions', [
      ...[
        '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
        '11', '11-5', '12', '13', '14', '14-5', '15', '16', '17',
        '18', '19', '20',
      ].map((id) => link(`Sesión ${id.replace('-5', '.5')}`, `/campaign/sessions/${id}`)),
    ]),
    category('Arcs', [link('Acto 1', '/campaign/arcs/acto-1')]),
  ], '/sessions'),
  link('Facciones', '/factions'),
  link('Biblioteca', '/documents'),
  category('Mecánicas', [
    link('Índice general', '/mechanics'),
    category('Clases', characterClasses.map(({id, name}) => link(name, getCharacterClassHref(id))), '/mechanics/classes'),
    link('Sistemas y objetos', '/systems'),
    link('Deck of Fate', '/systems/deck-of-fate'),
  ], '/mechanics'),
  link('Calendario', '/calendar/'),
  category('Índices', [link('Glosario', '/indexes/glossary')]),
  category('✦ Actualizaciones', [link('v0.1.0', '/releases/v0.1.0')], '/releases'),
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
