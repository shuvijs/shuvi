import { createPlugin } from '@shuvi/service';
import { escapeRegExp } from '@shuvi/utils/lib/escapeRegExp';
import ModuleReplacePlugin from '@shuvi/toolpack/lib/webpack/plugins/module-replace-plugin';
import RequireCacheHotReloaderPlugin from '@shuvi/toolpack/lib/webpack/plugins/require-cache-hot-reloader-plugin';
import { ROUTE_RESOURCE_QUERYSTRING } from '@shuvi/shared/lib/constants';

const dumbRouteComponent = require.resolve('./emptyComponent');

export default createPlugin({
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
  },
  addServerPlugin: () => [require.resolve('./server')]
});
