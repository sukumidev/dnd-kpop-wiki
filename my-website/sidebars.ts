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
            'campaign/sessions/02',
            'campaign/sessions/03',
            'campaign/sessions/04',
            'campaign/sessions/05',
            'campaign/sessions/06',
            'campaign/sessions/07',
            'campaign/sessions/08',
            'campaign/sessions/09',
            'campaign/sessions/10',
            'campaign/sessions/11',
            'campaign/sessions/11-5',
            'campaign/sessions/12',
            'campaign/sessions/13',
            'campaign/sessions/14',
            'campaign/sessions/14-5',
            'campaign/sessions/15',
            'campaign/sessions/16',
            'campaign/sessions/17',
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
