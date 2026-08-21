import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  wiki: [
    'start-here',

    {
      type: 'category',
      label: 'Personajes',
      collapsed: false,
      items: [
        {
          type: 'link',
          label: 'Directorio de personajes',
          href: '/characters',
        },
        // opcional: atajos a cosas “top”
        // { type: 'doc', id: 'characters/party/index', label: 'Party' },
      ],
    },

    {
      type: 'category',
      label: 'Cosmología',
      collapsed: true,
      items: [
        {
          type: 'link',
          label: 'Directorio cosmológico',
          href: '/cosmology',
        },
      ],
    },

    {
      type: 'category',
      label: 'World',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Realms',
          items: [
            { type: 'doc', id: 'world/realms/hyberia', label: 'Hyberia' },
            { type: 'doc', id: 'world/realms/jeyperia', label: 'Jeyperia' },
            { type: 'doc', id: 'world/realms/sylmorien', label: 'Sylmorien' },
            { type: 'doc', id: 'world/realms/ygdrassil', label: 'Yggdrasil' },
          ],
        },
        {
          type: 'category',
          label: 'Locations',
          items: [
            'world/locations/isla-estelar',
            // agrega más aquí cuando existan
          ],
        },
        'world/timeline',
      ],
    },

    {
      type: 'category',
      label: 'Campaign',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Sessions',
          items: [
            {
              type: 'link',
              label: 'Crónica de sesiones',
              href: '/sessions',
            },
            'campaign/sessions/01',
            // cuando tengas más: 'campaign/sessions/02', etc.
          ],
        },
        {
          type: 'category',
          label: 'Arcs',
          items: [
            'campaign/arcs/acto-1',
            // más actos luego
          ],
        },
      ],
    },

    {
      type: 'category',
      label: 'Facciones',
      collapsed: true,
      items: [
        {
          type: 'link',
          label: 'Directorio de facciones',
          href: '/factions',
        },
        'factions/lobos-perdidos',
        // agrega más docs de facciones aquí
      ],
    },

    {
      type: 'link',
      label: 'Documentos',
      href: '/documents',
    },

    {
      type: 'category',
      label: 'Mecánicas',
      collapsed: true,
      items: [
        { type: 'doc', id: 'mechanics/index', label: 'Índice general' },
      ],
    },

    {
      type: 'category',
      label: 'Sistemas y Objetos',
      collapsed: true,
      items: [
        'systems/deck-of-fate',
      ],
    },

    {
      type: 'category',
      label: 'Calendario',
      collapsed: true,
      items: [
        'calendar/index',
      ],
    },

    {
      type: 'category',
      label: 'Índices',
      collapsed: true,
      items: [
        'indexes/glossary',
      ],
    },
  ],
};

export default sidebars;
