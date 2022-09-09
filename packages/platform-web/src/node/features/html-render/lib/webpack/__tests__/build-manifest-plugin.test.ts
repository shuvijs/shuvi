import BuildManifestPlugin from '../build-manifest-plugin';
import { createCompiler } from './helpers/webpack';
import { resolveFixture } from './utils';

const entry = resolveFixture('manifest');

describe('build-manifest-plugin', () => {
  test('default', done => {
    expect.assertions(1);
    const compiler = createCompiler({
      entry: entry,
      optimization: {
        runtimeChunk: {
          name: 'runtime'
        }
      },
      plugins: [
        new BuildManifestPlugin({
          filename: 'build-manifest.json'
        })
      ]
    });

    compiler.hooks.emit.tap('test', compilation => {
      expect(
        JSON.parse(
          compilation.assets['build-manifest.json'].source().toString()
        )
      ).toStrictEqual({
        polyfillFiles: [],
        entries: {
          main: {
            js: ['runtime.js', 'main.js']
          }
        },
        bundles: {
          main: 'main.js',
          runtime: 'runtime.js'
        },
        chunkRequest: {},
        loadble: {}
      });
    });

    compiler.run(done);
  });

  test('enable all', done => {
    expect.assertions(1);
    const compiler = createCompiler({
      entry: entry,
      optimization: {
        runtimeChunk: {
          name: 'runtime'
        }
      },
      plugins: [
        new BuildManifestPlugin({
          filename: 'build-manifest.json',
          modules: true,
          chunkRequest: true
        })
      ]
    });

    compiler.hooks.emit.tap('test', compilation => {
      expect(
        JSON.parse(
          compilation.assets['build-manifest.json'].source().toString()
        )
      ).toStrictEqual({
        polyfillFiles: [],
        entries: {
          main: {
            js: ['runtime.js', 'main.js']
          }
        },
        bundles: {
          main: 'main.js',
          runtime: 'runtime.js'
        },
        chunkRequest: {
          'static/chunks/helperOne.js': './shared/one',
          'static/chunks/helperTwo.js': './shared/two',
          'main.js': entry,
          'runtime.js': entry
        },
        loadble: {
          './shared/one': {
            children: [
              {
                id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/manifest/shared/one.js',
                name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/manifest/shared/one.js'
              }
            ],
            files: ['static/chunks/helperOne.js']
          },
          './shared/two': {
            children: [
              {
                id: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/manifest/shared/two.js',
                name: './packages/platform-web/src/node/features/html-render/lib/webpack/__tests__/fixtures/manifest/shared/two.js'
              }
            ],
            files: ['static/chunks/helperTwo.js']
          }
        }
      });
    });

    compiler.run(done);
  });
});
