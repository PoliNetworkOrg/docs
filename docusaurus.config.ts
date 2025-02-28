import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  // "engine" config
  future: {
    experimental_faster: {
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      rspackBundler: true,
      mdxCrossCompilerCache: true,
    },
  },

  // Website config
  title: 'PoliNetwork Docs',
  tagline: 'Technical Documentation for PoliNetwork',
  favicon: 'img/favicon.ico',

  url: 'https://docs.polinetwork.org',
  baseUrl: '/',
  organizationName: 'polinetworkorg',
  projectName: 'docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/polinetworkorg/docs/tree/main',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'PoliNetwork Docs',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          position: 'left',
          sidebarId: 'infra',
          label: 'Infrastructure',
        },
        {
          type: 'docSidebar',
          position: 'left',
          sidebarId: 'polifemo',
          label: 'Polifemo (deprecated)',
        },
        {
          href: 'https://github.com/polinetworkorg/docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/docs/intro',
            },
            {
              label: 'Infrastructure',
              to: '/docs/infrastructure/Introduction',
            },
            {
              label: 'Polifemo (deprecated)',
              to: '/docs/app',
            },
          ],
        },
        {
          title: 'Main Links',
          items: [
            {
              label: 'Main Site',
              href: 'https://polinetwork.org',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/polinetworkorg', // Completed the GitHub link
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Main Telegram Group',
              href: 'https://t.me/poligruppo',
            },
            {
              label: 'Projects Telegram Group',
              href: 'https://t.me/+C2Qb3SVo5qQwMzRk',
            },
            {
              label: 'Instagram',
              href: 'https://www.instagram.com/polinetwork_/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} PoliNetwork APS - Built with Docusaurus`,
      logo: {
        src: 'img/logo.png',
        alt: 'PoliNetwork Logo',
        href: 'https://polinetwork.org',
        height: '100px',
      },
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      magicComments: [
        {
          className: 'theme-code-block-highlighted-line',
          line: 'highlight-next-line',
          block: {start: 'highlight-start', end: 'highlight-end'},
        },
        {
          className: 'code-block-add-line',
          line: 'add-highlight-next-line',
          block: {start: 'add-highlight-start', end: 'add-highlight-end'},
        },
        {
          className: 'code-block-remove-line',
          line: 'remove-highlight-next-line',
          block: {start: 'remove-highlight-start', end: 'remove-highlight-end'},
        },
        {
          className: 'code-block-error-line',
          line: 'error-highlight-next-line',
          block: {start: 'error-highlight-start', end: 'error-highlight-end'},
        },
      ]
    },
  } satisfies Preset.ThemeConfig,
}

export default config
