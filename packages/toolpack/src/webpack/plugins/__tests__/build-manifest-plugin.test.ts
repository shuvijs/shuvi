import BuildManifestPlugin from '../build-manifest-plugin';
import webpack, { Configuration } from 'webpack';
import { runCompiler } from './helpers/runCompiler';
import { resolveFixture } from './utils';

describe.only('build-manifest-plugin', () => {
  test('basic', async (done) => {
    const webpackConfig = require(resolveFixture(
      'buildManifest',
      'basic',
      'webpack.config.js'
    ));

    const compiler = webpack({
      ...webpackConfig,
      plugins: [new BuildManifestPlugin({ filename: 'build-manifest.json' })],
    } as Configuration);

    const stats = await runCompiler(compiler);

    const result = stats.compilation.assets['build-manifest.json'].source();
    expect(JSON.parse(result)).toStrictEqual({
      chunks: {
        another: 'another.js',
        index: 'index.js',
      },
      entries: {
        another: {
          js: ['another.js'],
        },
        index: {
          js: ['index.js'],
        },
        'page-1234': {
          js: ['page-1234.js'],
        },
      },
      loadble: {},
      routes: {
        'page-1234': {
          js: ['page-1234.js'],
        },
      },
    });

    done();
  });
});
