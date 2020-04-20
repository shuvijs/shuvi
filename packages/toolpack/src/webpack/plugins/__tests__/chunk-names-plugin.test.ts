import ChunkNamesPlugin from '../chunk-names-plugin';
import { runCompiler } from './helpers/webpack';
import { resolveFixture } from './utils';

describe('chunk-names-plugin', () => {
  test('without plugin, main is named as chunk', async (done) => {
    const stats = await runCompiler({
      entry: resolveFixture('basic'),
      optimization: {
        runtimeChunk: {
          name: 'runtime',
        },
      },
    });
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
    const stats = await runCompiler({
      entry: resolveFixture('basic'),
      optimization: {
        runtimeChunk: {
          name: 'runtime',
        },
      },
      plugins: [new ChunkNamesPlugin()],
    });

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
