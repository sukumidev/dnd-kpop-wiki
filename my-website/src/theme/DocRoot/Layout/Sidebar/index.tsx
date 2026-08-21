import React, {type ReactNode, useCallback} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useLocation} from '@docusaurus/router';
import DocSidebar from '@theme/DocSidebar';
import SidebarRail from '@site/src/components/SidebarRail';
import type {Props} from '@theme/DocRoot/Layout/Sidebar';
import styles from './styles.module.css';

export default function DocRootLayoutSidebar({
  sidebar,
  hiddenSidebarContainer,
  setHiddenSidebarContainer,
}: Props): ReactNode {
  const {pathname} = useLocation();
  const toggleSidebar = useCallback(() => {
    setHiddenSidebarContainer((value) => !value);
  }, [setHiddenSidebarContainer]);

  return (
    <aside
      className={clsx(
        ThemeClassNames.docs.docSidebarContainer,
        styles.docSidebarContainer,
        hiddenSidebarContainer && styles.docSidebarContainerCollapsed,
      )}
      data-sidebar-state={hiddenSidebarContainer ? 'collapsed' : 'expanded'}>
      <div className={styles.sidebarViewport}>
        {hiddenSidebarContainer ? (
          <SidebarRail sidebar={sidebar} path={pathname} onExpand={toggleSidebar} />
        ) : (
          <DocSidebar
            sidebar={sidebar}
            path={pathname}
            onCollapse={toggleSidebar}
            isHidden={false}
          />
        )}
      </div>
    </aside>
  );
}
