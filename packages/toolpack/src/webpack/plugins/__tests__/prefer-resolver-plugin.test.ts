import webpack, { Configuration } from 'webpack';
import { runCompiler } from './helpers/runCompiler';
import { resolveFixture } from './utils';
import PreferResolverPlugin from '../prefer-resolver-plugin';

describe('prefer-resolver-plugin', () => {
  test('without plugin', async (done) => {
    const webpackConfig = require(resolveFixture(
      'preferResolverPlugin',
      'webpack.config.js'
    ));

    const compiler = webpack({
      ...webpackConfig,
      target: 'web',
    } as Configuration);
    const stats = await runCompiler(compiler);
    const result = stats.toJson();

    expect(result.modules?.length).toBe(1);
    expect(result.modules?.[0].source).toMatchInlineSnapshot(`
      "const a = 'this is just a normal js extension file';
      "
    `);

    done();
  });

  test('basic with .web extension', async (done) => {
    const webpackConfig = require(resolveFixture(
      'preferResolverPlugin',
      'webpack.config.js'
    ));

    const compiler = webpack({
      ...webpackConfig,
      target: 'web',
      resolve: {
        plugins: [new PreferResolverPlugin({ suffix: 'web' })],
      },
    } as Configuration);
    const stats = await runCompiler(compiler);
    const result = stats.toJson();

    expect(result.modules?.length).toBe(1);
    expect(result.modules?.[0].source).toMatchInlineSnapshot(`
      "const a = 'this is a web extension file';
      "
    `);
    done();
  });
});
