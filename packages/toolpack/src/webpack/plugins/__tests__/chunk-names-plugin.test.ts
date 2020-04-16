import ChunkNamesPlugin from '../chunk-names-plugin';
import webpack, { Configuration } from 'webpack';
import { runCompiler } from './helpers/runCompiler';
import { resolveFixture } from './utils';

describe('chunk-names-plugin', () => {
  test('without plugin, main is named as chunk', async (done) => {
    const webpackConfig = require(resolveFixture('basic', 'webpack.config.js'));

    const compiler = webpack(webpackConfig as Configuration);
    const stats = await runCompiler(compiler);
    const result = stats.toJson();

    expect(result.assetsByChunkName).toMatchInlineSnapshot(`
      Object {
        "helperOne": "static/chunks/helperOne.js",
        "helperTwo": "static/chunks/helperTwo.js",
        "main": "static/chunks/main.js",
        "runtime": "runtime.js",
      }
    `);

    done();
  });

  test('with plugin, main is not named as chunk', async (done) => {
    const webpackConfig = require(resolveFixture('basic', 'webpack.config.js'));

    const compiler = webpack({
      ...webpackConfig,
      plugins: [new ChunkNamesPlugin()],
    } as Configuration);

    const stats = await runCompiler(compiler);
    const result = stats.toJson();

    expect(result.assetsByChunkName).toMatchInlineSnapshot(`
      Object {
        "helperOne": "static/chunks/helperOne.js",
        "helperTwo": "static/chunks/helperTwo.js",
        "main": "main.js",
        "runtime": "runtime.js",
      }
    `);

    done();
  });
});
