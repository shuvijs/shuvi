import webpack, { sources } from 'webpack';
import path from 'path';
import { urlToRequest } from 'loader-utils';
import { IFileType } from '../types';

const PLUGIN_NAME = 'ModifyChunksPlugin';
const commonChunks = ['runtime', 'vendors', 'taro', 'common'];
const appChunk = 'app.js';
const taroChunk = 'taro.js';
interface ModifyChunkPluginOptions {
  fileType: IFileType;
}

export default class ModifyChunkPlugin {
  fileType: IFileType;
  constructor(options: ModifyChunkPluginOptions) {
    this.fileType = options.fileType;
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation: webpack.Compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: PLUGIN_NAME,
            stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE
          },
          () => {
            // require other chunks at the top of app.js
            const appJs = compilation.getAsset(appChunk);
            if (appJs) {
              compilation.updateAsset(
                appChunk,
                source =>
                  new sources.ConcatSource(
                    ...commonChunks.map(name => `require('./${name}');\n`),
                    source
                  )
              );
            }

            // modify the source code of @tarojs/runtime
            const taroJs = compilation.getAsset(taroChunk);
            if (taroJs) {
              compilation.updateAsset(
                taroChunk,
                source =>
                  new sources.RawSource(
                    (source.source() as string).replace(
                      "const isBrowser = typeof document !== 'undefined' && !!document.scripts",
                      'const isBrowser = false'
                    )
                  )
              );
            }

            // require other style chunks at app.bxss
            const appStyleName = `app${this.fileType.style}`;
            const appStyle = compilation.getAsset(appStyleName);
            if (appStyle) {
              const requiredFiles = compilation
                .getAssets()
                .map(asset => asset && asset.name)
                .filter(name => {
                  const fileName = path.basename(name, path.extname(name));
                  return (
                    /\.bxss$/.test(name) && commonChunks.includes(fileName)
                  );
                });
              compilation.updateAsset(
                appStyleName,
                source =>
                  new sources.ConcatSource(
                    source,
                    ...requiredFiles.map(
                      file => `\n@import ${JSON.stringify(urlToRequest(file))};`
                    )
                  )
              );
            }
          }
        );
      }
    );
  }
}
