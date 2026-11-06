import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  wiki: [
    'start-here',

    {
      type: 'link',
      label: 'Personajes',
      href: '/characters',
    },

    {
      type: 'link',
      label: 'Cosmología',
      href: '/cosmology',
    },

    {
      type: 'link',
      label: 'World',
      href: '/world',
    },

    {
      type: 'link',
      label: 'Campaign',
      href: '/sessions',
    },

    {
      type: 'link',
      label: 'Facciones',
      href: '/factions',
    },

    {
      type: 'link',
      label: 'Biblioteca',
      href: '/documents',
    },

    {
      type: 'category',
      label: 'Calendario',
      collapsed: true,
      items: [
        'calendar/index',
      ],
    },

  ],
};

export default sidebars;
