import { createCompiler } from './helpers/webpack';
import { resolveFixture } from './utils';
import ResolveWithSuffixFirstPlugin from '../resolve-with-suffix-first-plugin';

describe('resolve-with-suffix-first-plugin', () => {
  test('without plugin', done => {
    expect.assertions(11);
    const compiler = createCompiler({
      entry: resolveFixture('resolve-with-suffix-first')
    });

    compiler.hooks.emit.tap('test', compilation => {
      const source = compilation.assets['main.js'].source();

      expect(source).toMatch('/resolve-with-suffix-first/a.js');
      expect(source).toMatch('/resolve-with-suffix-first/b.js');
      expect(source).toMatch('/resolve-with-suffix-first/c.js');
      expect(source).toMatch('/resolve-with-suffix-first/e.js');

      expect(source).not.toMatch('/resolve-with-suffix-first/a.web.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/b.electron.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/c.web.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/c.electron.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/d.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/d.electron.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/e.electron.js');
    });

    compiler.run(done);
  });

  test(`with 'electron' suffix`, done => {
    expect.assertions(11);
    const compiler = createCompiler({
      entry: resolveFixture('resolve-with-suffix-first'),
      resolve: {
        plugins: [new ResolveWithSuffixFirstPlugin({ suffix: 'electron' })]
      }
    });

    compiler.hooks.emit.tap('test', compilation => {
      const source = compilation.assets['main.js'].source();

      expect(source).toMatch('/resolve-with-suffix-first/a.js');
      expect(source).toMatch('/resolve-with-suffix-first/b.electron.js');
      expect(source).toMatch('/resolve-with-suffix-first/c.electron.js');
      expect(source).toMatch('/resolve-with-suffix-first/d.electron.js');
      expect(source).toMatch('/resolve-with-suffix-first/e.js');

      expect(source).not.toMatch('/resolve-with-suffix-first/a.web.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/b.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/c.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/c.web.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/d.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/e.electron.js');
    });

    compiler.run(done);
  });

  test(`with 'web' suffix`, done => {
    expect.assertions(13);
    const compiler = createCompiler({
      entry: resolveFixture('resolve-with-suffix-first'),
      resolve: {
        plugins: [new ResolveWithSuffixFirstPlugin({ suffix: 'web' })]
      }
    });

    compiler.hooks.emit.tap('test', compilation => {
      const source = compilation.assets['main.js'].source();

      expect(source).toMatch('/resolve-with-suffix-first/a.web.js');
      expect(source).toMatch('/resolve-with-suffix-first/b.js');
      expect(source).toMatch('/resolve-with-suffix-first/c.web.js');
      expect(source).toMatch('/resolve-with-suffix-first/e.js');

      expect(source).not.toMatch('/resolve-with-suffix-first/a.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/a.electron.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/b.web.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/b.electron.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/c.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/c.electron.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/d.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/d.web.js');
      expect(source).not.toMatch('/resolve-with-suffix-first/e.web.js');
    });

    compiler.run(done);
  });
});
