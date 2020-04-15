import BuildManifestPlugin from '../build-manifest-plugin';
import webpack, { Configuration } from 'webpack';
import { runCompiler } from './helpers/runCompiler';
import { resolveFixture } from './utils';

describe.only('build-manifest-plugin', () => {
  test.only('basic', async (done) => {
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
        main: 'static/chunks/main.js',
        'runtime~main': 'runtime~main.js',
      },
      entries: {
        main: {
          js: ['runtime~main.js', 'static/chunks/main.js'],
        },
      },
      loadble: {},
      routes: {},
    });

    done();
  });

  test.only('basic with modules', async (done) => {
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
        main: 'static/chunks/main.js',
        'runtime~main': 'runtime~main.js',
      },
      entries: {
        main: {
          js: ['runtime~main.js', 'static/chunks/main.js'],
        },
      },
      loadble: {
        './helpers/1': {
          children: [
            {
              id: 1,
              name:
                './packages/toolpack/src/webpack/plugins/__tests__/fixtures/buildManifest/basic/helpers/1.js',
            },
          ],
          files: ['static/chunks/2.js'],
        },
        './helpers/2': {
          children: [
            {
              id: 2,
              name:
                './packages/toolpack/src/webpack/plugins/__tests__/fixtures/buildManifest/basic/helpers/2.js',
            },
          ],
          files: ['static/chunks/3.js'],
        },
      },
      routes: {},
    });

    done();
  });
});
