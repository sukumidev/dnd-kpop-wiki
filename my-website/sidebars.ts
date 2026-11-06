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
      type: 'category',
      label: 'World',
      collapsed: true,
      items: [
        {type: 'link', label: 'Índice de reinos', href: '/world'},
        'world/realms/hyberia',
        'world/realms/sylmorien',
        'world/realms/jeyperia',
        'world/realms/ygdrassil',
      ],
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
      type: 'link',
      label: 'Calendario',
      href: '/calendar/',
    },

  ],
};

export default sidebars;
