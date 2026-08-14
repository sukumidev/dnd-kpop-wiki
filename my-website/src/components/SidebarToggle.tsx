import React, {useEffect, useState} from 'react';
import {useLocation} from '@docusaurus/router';

const SIDEBAR_DRAWER_BREAKPOINT = 1200;
const DOCUSAURUS_MOBILE_BREAKPOINT = 996;

export default function SidebarToggle() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const sidebar =
        document.querySelector('.theme-doc-sidebar-container') ??
        document.querySelector('[class*="docSidebarContainer"]');
      const needsDrawer =
        window.innerWidth > DOCUSAURUS_MOBILE_BREAKPOINT &&
        window.innerWidth <= SIDEBAR_DRAWER_BREAKPOINT &&
        Boolean(sidebar);

      setShouldShow(needsDrawer);
      if (!needsDrawer) setOpen(false);
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle('hally-sidebar-open', open);
    return () => document.documentElement.classList.remove('hally-sidebar-open');
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const sidebar =
        document.querySelector('.theme-doc-sidebar-container') ??
        document.querySelector('[class*="docSidebarContainer"]');

      if (sidebar && sidebar.contains(e.target as Node)) return;

      const btn = document.getElementById('hally-sidebar-toggle-btn');
      if (btn && btn.contains(e.target as Node)) return;

      setOpen(false);
    };

    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  if (!shouldShow) return null;

  return (
    <button
      id="hally-sidebar-toggle-btn"
      onClick={() => setOpen(value => !value)}
      aria-label={open ? 'Cerrar sidebar' : 'Abrir sidebar'}
      aria-pressed={open}
      style={{
        position: 'fixed',
        left: 12,
        bottom: 12,
        zIndex: 9999,
        width: 44,
        height: 44,
        display: 'grid',
        placeItems: 'center',
        border: '1px solid var(--h-border)',
        borderRadius: 'var(--h-radius-ui)',
        background: 'color-mix(in srgb, var(--h-bg-soft) 92%, transparent)',
        color: 'var(--h-text)',
        fontWeight: 900,
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
      }}>
      {open ? '\u00d7' : '\u2630'}
    </button>
  );
}
