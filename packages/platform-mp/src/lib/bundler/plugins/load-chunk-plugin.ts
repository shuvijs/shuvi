import webpack, { sources } from 'webpack';
import path from 'path';
import { urlToRequest } from 'loader-utils';

const PLUGIN_NAME = 'LoadChunksPlugin';
const commonChunks = ['runtime', 'vendors', 'taro', 'common'];
const appChunk = 'app.js';
const taroChunk = 'taro.js';

export default class TaroLoadChunksPlugin {
  constructor() {}

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
            const appStyle = compilation.getAsset('app.bxss');
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
                'app.bxss',
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
