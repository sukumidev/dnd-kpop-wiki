import React, {useId, useState, type FocusEvent, type MouseEvent} from 'react';
import {createPortal} from 'react-dom';
import Link from '@docusaurus/Link';
import type {
  PropSidebar,
  PropSidebarItem,
} from '@docusaurus/plugin-content-docs';
import styles from './SidebarRail.module.css';

type Props = {
  sidebar: PropSidebar;
  path: string;
  onExpand: () => void;
};

type RailItem = {
  href: string;
  label: string;
};

function firstHref(item: PropSidebarItem): string | undefined {
  if (item.type === 'link') return item.href;
  if (item.type !== 'category') return undefined;
  return item.href ?? item.items.map(firstHref).find(Boolean);
}

function getRailItems(sidebar: PropSidebar): RailItem[] {
  return sidebar.flatMap((item) => {
    if (item.type === 'html') return [];
    const href = firstHref(item);
    return href ? [{href, label: item.label}] : [];
  });
}

function isActive(path: string, href: string) {
  if (href === '/') return path === '/';
  const section = href.split('/').filter(Boolean)[0];
  return section ? path === `/${section}` || path.startsWith(`/${section}/`) : false;
}

function RailIcon({label}: {label: string}) {
  const normalized = label.toLocaleLowerCase();
  let content: React.ReactNode;

  if (normalized.includes('start') || normalized.includes('inicio')) {
    content = <><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5M9 21v-7h6v7"/></>;
  } else if (normalized.includes('person')) {
    content = <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3.5 20c.5-4 2.4-6 5.5-6s5 2 5.5 6M14 15c3.6-.5 5.8 1.2 6.5 4.5"/></>;
  } else if (normalized.includes('cosmo')) {
    content = <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></>;
  } else if (normalized.includes('world')) {
    content = <><circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21M12 3C9.8 5.4 8.7 8.4 8.7 12S9.8 18.6 12 21"/></>;
  } else if (normalized.includes('campaign')) {
    content = <><path d="M5 22V3M6 4h12l-2 4 2 4H6"/></>;
  } else if (normalized.includes('faccion')) {
    content = <><path d="M12 2 20 6v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4Z"/><path d="m9 12 2 2 4-5"/></>;
  } else if (normalized.includes('document')) {
    content = <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></>;
  } else if (normalized.includes('mec')) {
    content = <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/></>;
  } else if (normalized.includes('sistema')) {
    content = <><rect x="4" y="5" width="16" height="14" rx="2"/><path d="m8 9 4 3-4 3M14 15h3"/></>;
  } else if (normalized.includes('calendar')) {
    content = <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 10h18M7 14h2M11 14h2M15 14h2M7 18h2M11 18h2"/></>;
  } else {
    content = <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></>;
  }

  return <svg aria-hidden="true" viewBox="0 0 24 24">{content}</svg>;
}

export default function SidebarRail({sidebar, path, onExpand}: Props) {
  const tooltipId = useId();
  const [tooltip, setTooltip] = useState<{label: string; top: number} | null>(null);
  const items = getRailItems(sidebar);

  const showTooltip = (
    label: string,
    event: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({label, top: rect.top + rect.height / 2});
  };

  return (
    <div className={styles.rail} data-sidebar-state="collapsed">
      <nav className={styles.navigation} aria-label="Wiki navigation">
        {items.map((item) => {
          const active = isActive(path, item.href);
          return (
            <Link
              key={`${item.label}-${item.href}`}
              to={item.href}
              className={`${styles.navItem} ${active ? styles.active : ''}`}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              aria-describedby={tooltip?.label === item.label ? tooltipId : undefined}
              onMouseEnter={(event) => showTooltip(item.label, event)}
              onMouseLeave={() => setTooltip(null)}
              onFocus={(event) => showTooltip(item.label, event)}
              onBlur={() => setTooltip(null)}>
              <RailIcon label={item.label} />
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        className={styles.expandButton}
        onClick={onExpand}
        aria-label="Expand sidebar"
        title="Expand sidebar">
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="m9 5 7 7-7 7" />
        </svg>
      </button>
      {tooltip && typeof document !== 'undefined' && createPortal(
        <div
          id={tooltipId}
          role="tooltip"
          className={styles.tooltip}
          style={{top: tooltip.top}}>
          {tooltip.label}
        </div>,
        document.body,
      )}
    </div>
  );
}
