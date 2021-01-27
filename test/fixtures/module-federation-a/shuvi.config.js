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
              name: 'mfeAAA',
              exposes: {
                './Component': './src/components/Component.js'
              },
              shared: [
                {
                  react: {
                    version: '16.13.0',

                    singleton: true // must be specified in each config
                  }
                }
              ]
            }
          ]);
          return config;
        }
      });
    }
  ]
};
