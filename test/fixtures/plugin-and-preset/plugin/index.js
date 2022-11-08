const { createPlugin } = require('shuvi');
const { BUNDLER_TARGET_SERVER } = require('@shuvi/shared/lib/constants');

module.exports = createPlugin({
  configWebpack: (config, { name, helpers }, context) => {
    if (name === BUNDLER_TARGET_SERVER) {
      helpers.addExternals(config, (data, next) => {
        const { request } = data;
        switch (request) {
          case 'lodash': {
            next(null, 'lodash');
            break;
          }
          default: {
            next(null, 'next');
          }
        }
      });
    }
    return config;
  },
  afterInit: () => {
    console.warn('afterInit');
  },
  afterBuild: () => {
    console.warn('afterBuild');
  },
  afterBundlerDone: () => {
    console.warn('bundlerDone');
  },
  afterBundlerTargetDone: () => {
    console.warn('bundlerTargetDone');
  }
});
