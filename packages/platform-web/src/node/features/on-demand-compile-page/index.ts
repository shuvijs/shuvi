import { createPlugin } from '@shuvi/service';
import { escapeRegExp } from '@shuvi/utils/escapeRegExp';
import ModuleReplacePlugin from '@shuvi/toolpack/webpack/plugins/module-replace-plugin';
import RequireCacheHotReloaderPlugin from '@shuvi/toolpack/webpack/plugins/require-cache-hot-reloader-plugin';
import { ROUTE_RESOURCE_QUERYSTRING } from '@shuvi/shared/constants';

const dumbRouteComponent = require.resolve('./emptyComponent');

const plugin = createPlugin({
  configWebpack(config, _, ctx) {
    if (ctx.mode === 'development') {
      config.plugin('private/module-replace-plugin').use(ModuleReplacePlugin, [
        {
          modules: [
            {
              resourceQuery: RegExp(
                escapeRegExp(`?${ROUTE_RESOURCE_QUERYSTRING}`)
              ),
              module: dumbRouteComponent
            }
          ]
        }
      ]);
      // Even though require.cache is server only we have to clear assets from both compilations
      // This is because the client compilation generates the build manifest that's used on the server side
      config
        .plugin('private/require-cache-hot-reloader')
        .use(RequireCacheHotReloaderPlugin);
    }

    return config;
  }
});

export default {
  core: plugin
};

export { default as OnDemandRouteManager } from './onDemandRouteManager';
