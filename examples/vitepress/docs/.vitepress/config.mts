import { defineConfig } from 'vitepress';
import * as sidebar from './sidebar.json';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Apexdocs Vitepress Example',
  description: 'Apexdocs Vitepress Example',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Changelog', link: '/changelog' },
      { text: 'Examples', link: '/markdown-examples' },
    ],

    sidebar: sidebar.default,

    socialLinks: [{ icon: 'github', link: 'https://github.com/vuejs/vitepress' }],
  },
});
