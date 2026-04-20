import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://giuseppeoncia.github.io',
  base: '/coge-showcase',
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    routing: { prefixDefaultLocale: true },
  },
  integrations: [mdx(), sitemap(), icon()],
});
