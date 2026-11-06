import React, {type ReactNode, useState} from 'react';
import Layout from '@theme/Layout';
import DocSidebar from '@theme/DocSidebar';
import {DocsSidebarProvider} from '@docusaurus/plugin-content-docs/client';
import {useLocation} from '@docusaurus/router';
import type {PropSidebar} from '@docusaurus/plugin-content-docs';
import SidebarRail from './SidebarRail';
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
  href?: string,
) => ({
  type: 'category' as const,
  label,
  collapsed,
  collapsible: true,
  href,
  items,
});

// Keep this resolved navigation aligned with sidebars.ts. Custom pages are not
// part of the docs route tree, so Docusaurus does not provide sidebar props.
const wikiSidebar: PropSidebar = [
  link('Start Here', '/'),
  link('Personajes', '/characters'),
  link('Cosmología', '/cosmology'),
  category('World', [
    link('Hyberia', '/world/realms/hyberia'),
    link('Sylmorien', '/world/realms/sylmorien'),
    link('Jeyperia', '/world/realms/jeyperia'),
    link('Yggdrasil', '/world/realms/ygdrassil'),
  ], true, '/world'),
  link('Campaign', '/sessions'),
  link('Facciones', '/factions'),
  link('Biblioteca', '/documents'),
  link('Calendario', '/calendar/'),
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
