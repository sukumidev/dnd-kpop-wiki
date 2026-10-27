import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000';
const siteBaseUrl = process.env.BASE_URL ?? '/';

const config: Config = {
  title: 'Hallyura Wiki',
  tagline: 'Wiki del universo de Hallyura',

  future: {
    v4: true,
  },

  url: siteUrl,
  baseUrl: siteBaseUrl,

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/', // ✅ wiki en home
          sidebarPath: require.resolve('./sidebars.ts'),
          exclude: ['characters/misc/**'],
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    ['@docusaurus/plugin-client-redirects', {
      redirects: [
        {from: '/factions/los-diecisiete-heroes', to: '/factions/svt'},
        {from: '/factions/neo-culturales-tecnologicos', to: '/factions/nct'},
        {from: '/factions/lobos-perdidos', to: '/factions/skz'},
        {from: '/factions/hijos-de-la-noche', to: '/factions/enhypen'},
        {from: '/factions/marea-negra', to: '/factions/ateez'},
        {from: '/cosmology/deities/tvxq-yunho', to: '/characters/npc/tvxq-yunho'},
        {from: '/cosmology/deities/tvxq-jaejoong', to: '/characters/npc/tvxq-jaejoong'},
        {from: '/cosmology/deities/tvxq-junsu', to: '/characters/npc/tvxq-junsu'},
        {from: '/cosmology/deities/tvxq-yoochun', to: '/characters/npc/tvxq-yoochun'},
        {from: '/cosmology/deities/tvxq-changmin', to: '/characters/npc/tvxq-changmin'},
        {from: '/cosmology/deities/t1-gumayusi', to: '/cosmology/deities/t1-peyz'},
      ],
    }],
  ],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        indexDocs: true,
        indexPages: true,
        language: ['es'],
      },
    ],
  ],

  themeConfig: {
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },

    navbar: {
      title: 'Hallyura Wiki',
      items: [],
    },

    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} Hallyura Wiki`,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
