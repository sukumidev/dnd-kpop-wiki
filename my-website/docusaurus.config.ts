import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import characterIdMapping from './scripts/character-id-mapping.json';
import characterRegistry from './src/data/characters.json';
import skzCharacterRegistry from './src/data/characters/skz.json';

const isPublicBuild = process.env.HALLYURA_PUBLIC_BUILD === 'true';
const allowedCharacterIds = new Set([
  ...Object.keys(characterRegistry),
  ...Object.keys(skzCharacterRegistry),
]);

const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000';
const siteBaseUrl = process.env.BASE_URL ?? '/';

// Keep bookmarks to character pages working after ID normalization.
const characterIdRedirects = Object.entries(
  characterIdMapping as Record<string, string>,
).filter(([, newId]) => !isPublicBuild || allowedCharacterIds.has(newId)).map(([oldId, newId]) => {
  const group = oldId === 'qin-shen-yu' ? 'party' : 'npc';
  return { from: `/characters/${group}/${oldId}`, to: `/characters/${group}/${newId}` };
});

// Characters added on main while the normalization PR was in progress.
const newCharacterIdRedirects = Object.entries({
  laura: 'npc-laura',
  yamal: 'npc-yamal',
  sixsevenaldo: 'npc-sixsevenaldo',
  'minji-gemela': 'npc-minji',
  'minsoo-gemela': 'npc-minsoo',
  abu: 'npc-abu',
  apu: 'npc-apu',
  agu: 'npc-agu',
}).filter(([, newId]) => !isPublicBuild || allowedCharacterIds.has(newId)).map(([oldId, newId]) => ({
  from: `/characters/npc/${oldId}`,
  to: `/characters/npc/${newId}`,
}));

const config: Config = {
  title: 'Hallyura Wiki',
  tagline: 'Wiki del universo de Hallyura',

  future: {
    v4: true,
  },

  url: siteUrl,
  baseUrl: siteBaseUrl,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

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
        ...characterIdRedirects,
        ...newCharacterIdRedirects,
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
