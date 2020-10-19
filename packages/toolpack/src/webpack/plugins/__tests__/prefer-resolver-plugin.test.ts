import { createCompiler } from './helpers/webpack';
import { resolveFixture } from './utils';
import PreferResolverPlugin from '../prefer-resolver-plugin';

describe('prefer-resolver-plugin', () => {
  test('without plugin', done => {
    expect.assertions(1);
    const compiler = createCompiler({
      entry: resolveFixture('prefer-resolver')
    });

    compiler.hooks.emit.tap('test', compilation => {
      expect(compilation.assets['main.js'].source()).toMatch(
        'this is just a normal js extension file'
      );
    });

    compiler.run(done);
  });

  test('basic with .web extension', done => {
    expect.assertions(1);
    const compiler = createCompiler({
      entry: resolveFixture('prefer-resolver'),
      resolve: {
        plugins: [new PreferResolverPlugin({ suffix: 'web' })]
      }
    });

    compiler.hooks.emit.tap('test', compilation => {
      expect(compilation.assets['main.js'].source()).toMatch(
        'this is a web extension file'
      );
    });

    compiler.run(done);
  });
});
