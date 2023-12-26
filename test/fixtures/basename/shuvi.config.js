export default {
  ssr: true,
  router: {
    history: 'browser'
  },
  plugins: [['./plugin', { basename: '/base-name' }]]
};
