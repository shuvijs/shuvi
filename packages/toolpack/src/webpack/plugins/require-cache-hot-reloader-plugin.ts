import { Compiler, WebpackPluginInstance } from 'webpack';
import { realpathSync } from 'fs';

function deleteCache(path: string) {
  try {
    delete require.cache[realpathSync(path)];
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  } finally {
    delete require.cache[path];
  }
}

// This plugin flushes require.cache after emitting the files. Providing 'hot reloading' of server files.
export default class RequireCacheHotReloader implements WebpackPluginInstance {
  prevAssets: any = null;

  apply(compiler: Compiler) {
    compiler.hooks.afterEmit.tapAsync(
      'RequireCacheHotReloader',
      (compilation, callback) => {
        const { assets } = compilation;
        if (this.prevAssets) {
          for (const f of Object.keys(assets)) {
            // @ts-ignore Poor webpack own typings https://github.com/webpack/webpack/issues/10828
            deleteCache(assets[f].existsAt);
          }
          for (const f of Object.keys(this.prevAssets)) {
            if (!assets[f]) {
              deleteCache(this.prevAssets[f].existsAt);
            }
          }
        }
        this.prevAssets = assets;

        callback();
      }
    );
  }
}
