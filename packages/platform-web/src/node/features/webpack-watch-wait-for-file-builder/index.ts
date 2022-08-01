import { createPlugin } from '@shuvi/service';
import WebpackWatchWaitForFileBuilderPlugin from './webpack-watch-wait-for-file-builder-plugin';

const plugin = createPlugin({
  configWebpack(config, _, ctx) {
    if (ctx.mode === 'development') {
      config
        .plugin('webpack-watch-wait-for-file-builder-plugin')
        .use(WebpackWatchWaitForFileBuilderPlugin, [
          {
            onBuildStart: ctx.onBuildStart,
            onBuildEnd: ctx.onBuildEnd
          }
        ]);
    }

    return config;
  }
});

export default {
  core: plugin
};
