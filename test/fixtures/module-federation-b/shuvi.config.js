const isDev = process.env.NODE_ENV === 'development';
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  ssr: true,
  plugins: [
    api => {
      api.tap('bundler:configTarget', {
        fn: config => {
          config.plugin('module-federation').use(ModuleFederationPlugin, [
            {
              remotes: {
                'mfe-b': 'mfeBBB@../dist/bbb/mfeBBB.js'
              },
              shared: {
                react: {
                  singleton: true // make sure only a single react module is used
                }
              }
            }
          ]);
          return config;
        }
      });
    }
  ]
};
