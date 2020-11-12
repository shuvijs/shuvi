import ChunkNamesPlugin from '../chunk-names-plugin';
import { createCompiler } from './helpers/webpack';
import { resolveFixture } from './utils';

const basicEntry = resolveFixture('basic');

describe('chunk-names-plugin', () => {
  test('without plugin, splitChunks are not named as chunk', async done => {
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
        Object {
          "framework": Array [
            "framework.js",
          ],
          "main": Array [
            "main.js",
          ],
          "runtime": Array [
            "runtime.js",
          ],
        }
      `);

      done();
    });
  });

  test('with plugin, splitChunks are named as chunk', async done => {
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
        Object {
          "framework": Array [
            "static/chunks/framework.js",
          ],
          "main": Array [
            "main.js",
          ],
          "runtime": Array [
            "runtime.js",
          ],
        }
      `);

      done();
    });
  });
});
