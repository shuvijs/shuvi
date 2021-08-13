import webpack, { sources } from 'webpack';
const PLUGIN_NAME = 'LoadChunksPlugin';
const commonChunks = ['runtime', 'vendors', 'taro', 'common'];
const entryChunk = 'app.js';

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
            const file = compilation.getAsset('app.js');
            if (file) {
              compilation.updateAsset(
                entryChunk,
                source =>
                  new sources.RawSource(
                    commonChunks
                      .map(name => `require('./${name}');\n`)
                      .join('') + source.source()
                  )
              );
            }
          }
        );
      }
    );
  }
}
