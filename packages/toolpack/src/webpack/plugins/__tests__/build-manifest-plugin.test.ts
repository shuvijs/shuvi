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

    expect(JSON.parse(result)).toMatchObject({
      entries: {
        index: {
          js: ['index.bundle.js'],
        },
        another: {
          js: ['another.bundle.js'],
        },
      },
      routes: {},
      chunks: {
        another: 'another.bundle.js',
        index: 'index.bundle.js',
      },
      loadble: {},
    });

    done();
  });
});
