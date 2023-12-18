export default {
  ssr: false,
  router: {
    history: 'browser'
  },
  plugins: [['./plugin', { basename: '/base-name' }]]
};
