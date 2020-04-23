import BuildManifestPlugin from '../build-manifest-plugin';
import { runCompiler } from './helpers/webpack';
import { resolveFixture } from './utils';

const basicEntry = resolveFixture('basic');

describe('build-manifest-plugin', () => {
  test('default', async done => {
    const stats = await runCompiler({
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
    const result = stats.compilation.assets['build-manifest.json'].source();
    expect(JSON.parse(result)).toStrictEqual({
      entries: {
        main: {
          js: ['runtime.js', 'static/chunks/main.js']
        }
      },
      bundles: {
        main: 'static/chunks/main.js',
        runtime: 'runtime.js'
      },
      chunkRequest: {},
      loadble: {}
    });

    done();
  });

  test('enable all', async done => {
    const stats = await runCompiler({
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
    const result = stats.compilation.assets['build-manifest.json'].source();
    expect(JSON.parse(result)).toStrictEqual({
      entries: {
        main: {
          js: ['runtime.js', 'static/chunks/main.js']
        }
      },
      bundles: {
        main: 'static/chunks/main.js',
        runtime: 'runtime.js'
      },
      chunkRequest: {
        'static/chunks/helperOne.js': '../shared/one',
        'static/chunks/helperTwo.js': '../shared/two',
        'static/chunks/main.js': basicEntry,
        'runtime.js': basicEntry
      },
      loadble: {
        '../shared/one': {
          children: [
            {
              id:
                './packages/toolpack/src/webpack/plugins/__tests__/fixtures/shared/one.js',
              name:
                './packages/toolpack/src/webpack/plugins/__tests__/fixtures/shared/one.js'
            }
          ],
          files: ['static/chunks/helperOne.js']
        },
        '../shared/two': {
          children: [
            {
              id:
                './packages/toolpack/src/webpack/plugins/__tests__/fixtures/shared/two.js',
              name:
                './packages/toolpack/src/webpack/plugins/__tests__/fixtures/shared/two.js'
            }
          ],
          files: ['static/chunks/helperTwo.js']
        }
      }
    });

    done();
  });
});
