import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'moment-less',
  description: 'Zero-dependency Moment.js-style formatting for the native JavaScript Temporal API',
  base: '/moment-less/',
  head: [
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: 'moment-less — Temporal API formatting' }],
    ['meta', { name: 'og:description', content: 'Zero-dependency token-based date formatting for the TC39 Temporal API. Familiar YYYY-MM-DD syntax, < 2KB gzipped.' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
  ],
  themeConfig: {
    logo: '🗓️',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/format' },
      { text: 'Recipes', link: '/recipes/' },
      { text: 'npm', link: 'https://www.npmjs.com/package/moment-less' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Browser & Runtime Support', link: '/guide/browser-support' },
            { text: 'Migrating from Moment.js', link: '/guide/migration' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'format()', link: '/api/format' },
            { text: 'fromNow()', link: '/api/from-now' },
            { text: 'calendar()', link: '/api/calendar' },
            { text: 'humanizeDuration()', link: '/api/humanize-duration' },
            { text: 'fromDate()', link: '/api/from-date' },
          ],
        },
      ],
      '/recipes/': [
        {
          text: 'Recipes',
          items: [
            { text: 'Overview', link: '/recipes/' },
            { text: 'React', link: '/recipes/react' },
            { text: 'Vue', link: '/recipes/vue' },
            { text: 'Common Patterns', link: '/recipes/common-patterns' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/thinkgrid-labs/moment-less' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Built for the TC39 Temporal API',
    },
    search: {
      provider: 'local',
    },
  },
})
