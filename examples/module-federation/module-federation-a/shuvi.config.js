const { ModuleFederationPlugin } = require('webpack').container;
const { BUNDLER_TARGET_SERVER } = require('shuvi');
const sharedDeps = require('../sharedDeps');
const fixChunk = require('../fixChunk');

module.exports = {
  asyncEntry: true,
  ssr: false,
  plugins: [
    api => {
      api.tap('bundler:configTarget', {
        fn: (config, { name }) => {
          const isServer = name === BUNDLER_TARGET_SERVER;

          if (isServer) {
          } else {
            fixChunk(config);
          }

          config.plugin('module-federation').use(ModuleFederationPlugin, [
            {
              name: 'mfeAAA',
              library: {
                type: config.output.get('libraryTarget') || 'var',
                name: 'mfeAAA'
              },
              filename: 'remoteEntry.js',
              exposes: {
                './Component': './src/components/Component.js',
                './Context': './src/context/sharedContext.js'
              },
              shared: sharedDeps
            }
          ]);

          // important for exposes to work
          config.optimization.runtimeChunk(false);

          // auto grab publicPath
          config.output.publicPath('auto');

          return config;
        }
      });
    }
  ]
};
