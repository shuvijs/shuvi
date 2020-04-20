import BuildManifestPlugin from '../build-manifest-plugin';
import { runCompiler } from './helpers/webpack';
import { resolveFixture } from './utils';

describe('build-manifest-plugin', () => {
  test('basic', async (done) => {
    const stats = await runCompiler({
      entry: resolveFixture('basic'),
      optimization: {
        runtimeChunk: {
          name: 'runtime',
        },
      },
      plugins: [
        new BuildManifestPlugin({
          filename: 'build-manifest.json',
          modules: false,
        }),
      ],
    });
    const result = stats.compilation.assets['build-manifest.json'].source();
    expect(JSON.parse(result)).toStrictEqual({
      chunks: {
        helperOne: 'static/chunks/helperOne.js',
        helperTwo: 'static/chunks/helperTwo.js',
        main: 'static/chunks/main.js',
        runtime: 'runtime.js',
      },
      entries: {
        main: {
          js: ['runtime.js', 'static/chunks/main.js'],
        },
      },
      loadble: {},
    });

    done();
  });

  test('basic with modules', async (done) => {
    const stats = await runCompiler({
      entry: resolveFixture('basic'),
      optimization: {
        runtimeChunk: {
          name: 'runtime',
        },
      },
      plugins: [
        new BuildManifestPlugin({
          filename: 'build-manifest.json',
          modules: true,
        }),
      ],
    });
    const result = stats.compilation.assets['build-manifest.json'].source();
    expect(JSON.parse(result)).toStrictEqual({
      chunks: {
        helperOne: 'static/chunks/helperOne.js',
        helperTwo: 'static/chunks/helperTwo.js',
        main: 'static/chunks/main.js',
        runtime: 'runtime.js',
      },
      entries: {
        main: {
          js: ['runtime.js', 'static/chunks/main.js'],
        },
      },
      loadble: {
        '../shared/one': {
          children: [
            {
              id:
                './packages/toolpack/src/webpack/plugins/__tests__/fixtures/shared/one.js',
              name:
                './packages/toolpack/src/webpack/plugins/__tests__/fixtures/shared/one.js',
            },
          ],
          files: ['static/chunks/helperOne.js'],
        },
        '../shared/two': {
          children: [
            {
              id:
                './packages/toolpack/src/webpack/plugins/__tests__/fixtures/shared/two.js',
              name:
                './packages/toolpack/src/webpack/plugins/__tests__/fixtures/shared/two.js',
            },
          ],
          files: ['static/chunks/helperTwo.js'],
        },
      },
    });

    done();
  });
});
