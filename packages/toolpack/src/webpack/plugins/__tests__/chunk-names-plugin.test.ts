import ChunkNamesPlugin from '../chunk-names-plugin';
import { createCompiler } from './helpers/webpack';
import { resolveFixture } from './utils';

const basicEntry = resolveFixture('basic');

describe('chunk-names-plugin', () => {
  test('without plugin, splitChunks are not named as chunk', done => {
    const compiler = createCompiler({
      entry: basicEntry,
      optimization: {
        runtimeChunk: {
          name: 'runtime'
        },
        splitChunks: {
          cacheGroups: {
            framework: {
              chunks: 'all',
              name: 'framework',
              enforce: true
            }
          }
        }
      }
    });

    compiler.run((err, stats) => {
      const result = stats!.toJson();

      expect(result.assetsByChunkName).toMatchInlineSnapshot(`
        {
          "framework": [
            "framework.js",
          ],
          "main": [
            "main.js",
          ],
          "runtime": [
            "runtime.js",
          ],
        }
      `);

      done();
    });
  });

  test('with plugin, splitChunks are named as chunk', done => {
    const compiler = createCompiler({
      entry: basicEntry,
      optimization: {
        runtimeChunk: {
          name: 'runtime'
        },
        splitChunks: {
          cacheGroups: {
            framework: {
              chunks: 'all',
              name: 'framework',
              enforce: true
            }
          }
        }
      },
      plugins: [new ChunkNamesPlugin()]
    });

    compiler.run((err, stats) => {
      const result = stats!.toJson();

      expect(result.assetsByChunkName).toMatchInlineSnapshot(`
        {
          "framework": [
            "static/chunks/framework.js",
          ],
          "main": [
            "main.js",
          ],
          "runtime": [
            "runtime.js",
          ],
        }
      `);

      done();
    });
  });
});
