import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {hasPublicDocumentVisibility} from './src/data/documentVisibility';

type RouteDocument = {
  id?: unknown;
  status?: unknown;
  visibility?: unknown;
};

function getPublicDocumentRouteIds(): string[] {
  const documentsJson = require('./src/data/documents.json') as unknown;

  if (!Array.isArray(documentsJson)) {
    return [];
  }

  return documentsJson
    .filter((document): document is RouteDocument => Boolean(document && typeof document === 'object'))
    .filter(hasPublicDocumentVisibility)
    .map((document) => document.id)
    .filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
}

const config: Config = {
  title: 'My Site',
  tagline: 'Dinosaurs are cool',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://your-docusaurus-site.example.com',
  baseUrl: '/',

  organizationName: 'facebook',
  projectName: 'docusaurus',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/', // ✅ wiki en home
          sidebarPath: require.resolve('./sidebars.ts'),
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    function documentsRoutesPlugin() {
      return {
        name: 'documents-routes',
        contentLoaded({actions}) {
          const {addRoute} = actions;

          for (const id of getPublicDocumentRouteIds()) {
            addRoute({
              path: `/documents/${encodeURIComponent(id)}`,
              component: require.resolve('./src/components/documents/DocumentReaderPage.tsx'),
              exact: true,
            });
          }
        },
      };
    },
  ],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        indexDocs: true,
        indexBlog: false,
        indexPages: true,
        language: ['es'],
      },
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },

    navbar: {
      title: 'Hallyura Wiki',
      logo: {
        alt: 'Hallyura',
        src: 'img/logo.svg',
        href: '/',
      },

      items: [
        
      ],
    },

    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} `,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
