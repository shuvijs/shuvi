const isDev = process.env.NODE_ENV === 'development';
const { ModuleFederationPlugin } = require('webpack').container;
const { BUNDLER_TARGET_SERVER } = require('shuvi');
const path = require('path');
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
              name: 'mfeBBB',
              remotes: {
                mfeAAA: 'mfeAAA@http://localhost:8080/_shuvi/remoteEntry.js'
              },
              shared: sharedDeps
            }
          ]);

          return config;
        }
      });

      // api.tap('modifyHtml', {
      //   name: 'injectMF',
      //   fn: documentProps => {
      //     const tags = ['http://localhost:8080/_shuvi/remoteEntry.js'].map(
      //       remote => ({
      //         tagName: 'script',
      //         attrs: {
      //           src: remote
      //         }
      //       })
      //     );

      //     documentProps.scriptTags.push(tags[0]);
      //     return documentProps;
      //   }
      // });
    }
  ]
};
