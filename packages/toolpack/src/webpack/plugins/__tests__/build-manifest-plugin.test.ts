import BuildManifestPlugin from '../build-manifest-plugin';
import { createCompiler } from './helpers/webpack';
import { resolveFixture } from './utils';

const basicEntry = resolveFixture('basic');

describe('build-manifest-plugin', () => {
  test('default', done => {
    expect.assertions(1);
    const compiler = createCompiler({
      entry: basicEntry,
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
      entry: basicEntry,
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
          'static/chunks/helperOne.js': '../shared/one',
          'static/chunks/helperTwo.js': '../shared/two',
          'main.js': basicEntry,
          'runtime.js': basicEntry
        },
        loadble: {
          '../shared/one': {
            children: [
              {
                id: './packages/toolpack/src/webpack/plugins/__tests__/fixtures/shared/one.js',
                name: './packages/toolpack/src/webpack/plugins/__tests__/fixtures/shared/one.js'
              }
            ],
            files: ['static/chunks/helperOne.js']
          },
          '../shared/two': {
            children: [
              {
                id: './packages/toolpack/src/webpack/plugins/__tests__/fixtures/shared/two.js',
                name: './packages/toolpack/src/webpack/plugins/__tests__/fixtures/shared/two.js'
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
