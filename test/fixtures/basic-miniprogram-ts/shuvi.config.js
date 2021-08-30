module.exports = {
  ssr: false,
  platform: 'mp',
  framework: 'react',
  buildOptions: {
    target: 'weapp'
  },
  router: {
    history: 'memory'
  }
};
