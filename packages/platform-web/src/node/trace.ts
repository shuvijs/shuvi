import { CorePluginConstructor, createPlugin } from '@shuvi/service';
import { BUNDLER_TARGET_SERVER } from '../shared';
import { resolveLocal } from './paths';

const configWebpack: CorePluginConstructor['configWebpack'] = (
  config,
  { name, helpers }
) => {
  if (name === BUNDLER_TARGET_SERVER) {
    const tracePath = resolveLocal('@shuvi/service', 'lib/trace');
    helpers.addExternals(config, ({ request }, next) => {
      switch (request) {
        // trace is a singleton, so we don't want to bundle it
        case '@shuvi/service/lib/trace': {
          next(null, `commonjs ${tracePath}`);
          break;
        }
        default: {
          next(null, 'next');
        }
      }
    });
  }

  return config;
};

export default {
  core: createPlugin({
    configWebpack
  })
};
