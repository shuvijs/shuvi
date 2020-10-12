// ref: https://github.com/vercel/next.js/blob/canary/packages/next/build/webpack/plugins/nextjs-require-cache-hot-reloader.ts

import { Compiler } from 'webpack';
import { realpathSync } from 'fs';

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
export default class RequireCacheHotReloader {
  prevAssets: any = null;
  previousOutputPathsWebpack5: Set<string> = new Set();
  currentOutputPathsWebpack5: Set<string> = new Set();

  apply(compiler: Compiler) {
    compiler.hooks.assetEmitted.tap(
      PLUGIN_NAME,
      (_file: any, { targetPath }: any) => {
        this.currentOutputPathsWebpack5.add(targetPath);
        deleteCache(targetPath);
      }
    );

    compiler.hooks.afterEmit.tap(PLUGIN_NAME, compilation => {
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
