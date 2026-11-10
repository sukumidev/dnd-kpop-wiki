import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
import {characterClasses} from './src/data/characterClasses';

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
        {
          type: 'category',
          label: 'Realms',
          collapsed: true,
          items: [
            'world/realms/hyberia',
            'world/realms/sylmorien',
            'world/realms/jeyperia',
            'world/realms/ygdrassil',
            'world/realms/hotou',
            'world/realms/guozhong',
          ],
        },
        {
          type: 'category',
          label: 'Locations',
          collapsed: true,
          items: ['world/locations/isla-estelar'],
        },
        'world/timeline',
      ],
    },

    {
      type: 'category',
      label: 'Campaign',
      collapsed: true,
      items: [
        {type: 'link', label: 'Crónica de sesiones', href: '/sessions'},
        {
          type: 'category',
          label: 'Sessions',
          collapsed: true,
          items: [
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
            'campaign/sessions/18',
            'campaign/sessions/19',
            'campaign/sessions/20',
          ],
        },
        {
          type: 'category',
          label: 'Arcs',
          collapsed: true,
          items: ['campaign/arcs/acto-1'],
        },
      ],
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
      label: 'Mecánicas',
      collapsed: true,
      link: {type: 'doc', id: 'mechanics/index'},
      items: [
        {type: 'link', label: 'Índice general', href: '/mechanics'},
        {
          type: 'category',
          label: 'Clases',
          collapsed: true,
          link: {type: 'doc', id: 'mechanics/classes/index'},
          items: characterClasses.map(({id}) => `mechanics/classes/${id}`),
        },
        {type: 'doc', id: 'systems/index'},
        {type: 'doc', id: 'systems/deck-of-fate'},
      ],
    },

    {
      type: 'link',
      label: 'Calendario',
      href: '/calendar/',
    },

    {
      type: 'category',
      label: 'Índices',
      collapsed: true,
      items: ['indexes/glossary'],
    },

    {
      type: 'category',
      label: '✦ Actualizaciones',
      collapsed: true,
      link: {
        type: 'doc',
        id: 'releases/index',
      },
      items: [
        'releases/v0.1.0',
      ],
    },
  ],
};

export default sidebars;
