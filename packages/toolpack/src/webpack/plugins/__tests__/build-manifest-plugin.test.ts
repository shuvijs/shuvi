import BuildManifestPlugin from '../build-manifest-plugin';
import webpack, { Configuration } from 'webpack';
import { runCompiler } from './helpers/runCompiler';
import { resolveFixture } from './utils';

describe('build-manifest-plugin', () => {
  test('basic', async (done) => {
    const webpackConfig = require(resolveFixture(
      'buildManifest',
      'basic',
      'webpack.config.js'
    ));

    const compiler = webpack({
      ...webpackConfig,
      plugins: [
        new BuildManifestPlugin({
          filename: 'build-manifest.json',
          modules: false,
        }),
      ],
    } as Configuration);

    const stats = await runCompiler(compiler);
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
    const webpackConfig = require(resolveFixture(
      'buildManifest',
      'basic',
      'webpack.config.js'
    ));

    const compiler = webpack({
      ...webpackConfig,
      plugins: [
        new BuildManifestPlugin({
          filename: 'build-manifest.json',
          modules: true,
        }),
      ],
    } as Configuration);

    const stats = await runCompiler(compiler);
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
        './helpers/one': {
          children: [
            {
              id: 1,
              name:
                './packages/toolpack/src/webpack/plugins/__tests__/fixtures/buildManifest/basic/helpers/one.js',
            },
          ],
          files: ['static/chunks/helperOne.js'],
        },
        './helpers/two': {
          children: [
            {
              id: 2,
              name:
                './packages/toolpack/src/webpack/plugins/__tests__/fixtures/buildManifest/basic/helpers/two.js',
            },
          ],
          files: ['static/chunks/helperTwo.js'],
        },
      },
    });

    done();
  });
});
