import React, {useEffect, useState} from 'react';

const BREAKPOINT = 1200;

export default function SidebarToggle() {
  const [open, setOpen] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const small = window.innerWidth <= BREAKPOINT;
      setShouldShow(small);
      if (!small) setOpen(false);
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('hally-sidebar-open', open);
    return () => document.documentElement.classList.remove('hally-sidebar-open');
  }, [open]);

  // ESC para cerrar
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
  return (
    <button
      id="hally-sidebar-toggle-btn"
      onClick={() => setOpen(v => !v)}
      aria-label={open ? 'Cerrar sidebar' : 'Abrir sidebar'}
      aria-pressed={open}
      style={{
        position: 'fixed',
        left: 12,
        bottom: 12,
        zIndex: 9999,
        borderRadius: 999,
        width: 44,
        height: 44,
        display: 'grid',
        placeItems: 'center',
        border: '1px solid rgba(255,255,255,.12)',
        background: 'rgba(20,20,20,.85)',
        color: 'white',
        fontWeight: 900,
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
      }}
    >
      {open ? '✕' : '☰'}
    </button>
  );
}