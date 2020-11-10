// ref: https://github.com/vercel/next.js/blob/canary/packages/next/build/webpack/plugins/nextjs-require-cache-hot-reloader.ts

import { Compiler, Plugin } from 'webpack';
import path from 'path';
import { realpathSync } from 'fs';
import { BUILD_SERVER_FILE_SERVER } from '@shuvi/shared/lib/constants';

function deleteCache(filePath: string) {
  try {
    delete require.cache[realpathSync(filePath)];
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  } finally {
    delete require.cache[filePath];
  }
}

const PLUGIN_NAME = 'RequireCacheHotReloader';

// This plugin flushes require.cache after emitting the files. Providing 'hot reloading' of server files.
export default class RequireCacheHotReloader implements Plugin {
  previousOutputPathsWebpack5: Set<string> = new Set();
  currentOutputPathsWebpack5: Set<string> = new Set();

  apply(compiler: Compiler) {
    compiler.hooks.assetEmitted.tap(PLUGIN_NAME, (_file, { targetPath }) => {
      this.currentOutputPathsWebpack5.add(targetPath);
      deleteCache(targetPath);
    });

    compiler.hooks.afterEmit.tap(PLUGIN_NAME, compilation => {
      const serverRuntimePath = path.join(
        compilation.outputOptions.path!,
        `${BUILD_SERVER_FILE_SERVER}.js`
      );

      deleteCache(serverRuntimePath);

      for (const outputPath of this.previousOutputPathsWebpack5) {
        if (!this.currentOutputPathsWebpack5.has(outputPath)) {
          deleteCache(outputPath);
        }
      }

      this.previousOutputPathsWebpack5 = new Set(
        this.currentOutputPathsWebpack5
      );
      this.currentOutputPathsWebpack5.clear();
    });
  }
}
