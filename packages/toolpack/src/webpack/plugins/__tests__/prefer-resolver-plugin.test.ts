import { runCompiler } from './helpers/webpack';
import { resolveFixture } from './utils';
import PreferResolverPlugin from '../prefer-resolver-plugin';

describe('prefer-resolver-plugin', () => {
  test('without plugin', async () => {
    const stats = await runCompiler({
      entry: resolveFixture('prefer-resolver'),
    });
    expect(stats.compilation.assets['main.js'].source()).toMatch(
      'this is just a normal js extension file'
    );
  });

  test('basic with .web extension', async () => {
    const stats = await runCompiler({
      entry: resolveFixture('prefer-resolver'),
      resolve: {
        plugins: [new PreferResolverPlugin({ suffix: 'web' })],
      },
    });

    expect(stats.compilation.assets['main.js'].source()).toMatch(
      'this is a web extension file'
    );
  });
});
