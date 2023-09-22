import { defineConfig } from 'shuvi';

export default defineConfig({
  ssr: true,
  router: {
    history: 'browser'
  },
  plugins: [['./plugin']]
});
