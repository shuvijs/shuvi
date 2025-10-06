// ref: https://github.com/vercel/next.js/blob/canary/packages/next/build/webpack/plugins/nextjs-require-cache-hot-reloader.ts

import * as Rspack from '../../webpack';
import { realpathSync } from 'fs';

/**
 * Rspack plugin interface
 */
interface RspackPlugin {
  apply(compiler: Rspack.Compiler): void;
}

function deleteCache(filePath: string) {
  try {
    delete require.cache[realpathSync(filePath)];
  } catch (e: any) {
    if (e.code !== 'ENOENT') throw e;
  } finally {
    delete require.cache[filePath];
  }
}

const PLUGIN_NAME = 'RequireCacheHotReloader';

// This plugin flushes require.cache after emitting the files. Providing 'hot reloading' of server files.
export default class RequireCacheHotReloader implements RspackPlugin {
  previousOutputPathsWebpack5: Set<string> = new Set();
  currentOutputPathsWebpack5: Set<string> = new Set();

  apply(compiler: Rspack.Compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      compilation.hooks.additionalTreeRuntimeRequirements.tap(
        PLUGIN_NAME,
        (_chunk, runtimeRequirements) => {
          // add this so that the server.js would be emitted after every compilation
          runtimeRequirements.add(Rspack.RuntimeGlobals.getFullHash);
        }
      );
    });

    compiler.hooks.assetEmitted.tap(PLUGIN_NAME, (_file, { targetPath }) => {
      this.currentOutputPathsWebpack5.add(targetPath);
      deleteCache(targetPath);
    });

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
