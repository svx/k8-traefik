// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Traefik & Kubernetes',
  tagline: 'Traefik and Kubernetes',
  url: 'https://k8-traefik.vercel.app/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/traefikproxy-icon-color.png',
  customFields: {
    description:
      'Traefik Kubernetes Documentation',
  },

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'svx', // Usually your GitHub org/user name.
  projectName: 'k8-traefik', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          //sidebarPath: false,
          routeBasePath: '/', // Serve the docs at the site's root
          breadcrumbs: true,
          showLastUpdateTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/svx/k8-traefik/tree/main/docs/',
        },
        blog: {
          showReadingTime: false,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Traefik K8S',
        // logo: {
        //   alt: 'Traefik Proxy logo',
        //   src: 'img/logo-traefik-proxy-logo.svg',
        // },
        items: [
          // {
          //    type: 'doc',
          //    docId: 'test',
          //    position: 'left',
          //    label: 'Test',
          //  },
          //{to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/facebook/docusaurus',
            label: 'GitHub',
            position: 'right',
          },
          // {
          //   label: 'Sign in',
          //   href: 'https://hub.traefik.io/',
          //   target: '_blank',
          //   position: 'right',
          //   className: 'btn btn-primary header-login-link',
          // },
          // {
          //   label: 'Get a Demo',
          //   href: 'https://info.traefik.io/en/request-demo-traefik-enterprise',
          //   target: '_blank',
          //   position: 'right',
          //   className: 'btn btn-primary header-login-link',
          // },
        ],
      },
      metadata: [{name: 'keywords', content: 'traefik, kubernetes'}],
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Open Source',
            items: [
              {
                label: 'Traefik Proxy',
                href: 'https://traefik.io/traefik/',
              },
              {
                label: 'Traefik Mesh',
                href: 'https://traefik.io/traefik-mesh/',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/traefik',
              },
              {
                label: 'Documentation',
                href: 'https://doc.traefik.io/',
              },
              {
                label: 'Plugin Catalog',
                href: 'https://doc.traefik.io/',
              },
            ],
          },
          {
            title: 'Learn',
            items: [
              {
                label: 'Blog',
                href: 'https://traefik.io/blog/',
              },
              {
                label: 'Resource Library',
                href: 'https://traefik.io/resources/',
              },
              {
                label: 'Traefik Academy',
                href: 'https://academy.traefik.io/',
              },
              {
                label: 'Documentation',
                href: 'https://doc.traefik.io/',
              },
              {
                label: 'Success Story',
                href: 'https://traefik.io/success-stories/',
              },
              {
                label: 'Glossary',
                href: 'https://traefik.io/glossary/',
              },
              {
                label: 'Events',
                href: 'https://traefik.io/events/',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Join the Community',
                href: 'https://traefik.io/community/',
              },
              {
                label: 'Forum',
                href: 'https://community.traefik.io/',
              },
              {
                label: 'Community Library',
                href: 'https://traefik.io/community-library/',
              },
              {
                label: 'Community Voices',
                href: 'https://traefik.io/traefik-community-voices/',
              },
              {
                label: 'Traefik Ambassadors',
                href: 'https://traefik.io/traefik-ambassador-program/',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Traefik Labs. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
