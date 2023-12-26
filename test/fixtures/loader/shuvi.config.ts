import { defineConfig } from 'shuvi';
export default defineConfig({
  ssr: false,
  router: {
    history: 'browser'
  },
  plugins: [['./plugin', { basename: '/base' }]]
});
