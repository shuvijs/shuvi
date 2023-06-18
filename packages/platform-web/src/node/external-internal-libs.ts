import { CorePluginConstructor, createPlugin } from '@shuvi/service';
import { BUNDLER_TARGET_SERVER } from '../shared';
import { resolveDep } from './paths';

const configWebpack: CorePluginConstructor['configWebpack'] = (
  config,
  { name, helpers }
) => {
  if (name === BUNDLER_TARGET_SERVER) {
    helpers.addExternals(config, ({ request }, next) => {
      if (
        /@shuvi[/\\](hook|router$|utils|shared|platform-shared)/.test(request)
      ) {
        return next(null, resolveDep(request));
      } else {
        return next(null, 'next');
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
