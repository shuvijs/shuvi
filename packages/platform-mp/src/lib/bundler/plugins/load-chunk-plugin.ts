import webpack, { sources } from 'webpack';
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
                  new sources.RawSource(
                    commonChunks
                      .map(name => `require('./${name}');\n`)
                      .join('') + source.source()
                  )
              );
            }
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
          }
        );
      }
    );
  }
}
