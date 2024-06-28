import ModuleReplacePlugin from '../module-replace-plugin';
import { resolveFixture } from './utils';
import { watchCompiler, getModuleSource } from './helpers/webpack';

jest.setTimeout(5 * 60 * 1000);

describe('module-replace-plugin', () => {
  test('basic', done => {
    const compiler = watchCompiler({
      mode: 'development',
      entry: resolveFixture('module-replace'),
      plugins: [
        new ModuleReplacePlugin({
          modules: [
            {
              resourceQuery: /\?_lazy/,
              module: require.resolve('./fixtures/testDummyComponent')
            }
          ]
        })
      ]
    });

    compiler
      .waitForCompile(stats => {
        expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
          `testDummyComponent`
        );
        expect(getModuleSource(stats, /\.\.\/shared\/two\?_lazy/)).toMatch(
          `testDummyComponent`
        );
        expect(getModuleSource(stats, /module-replace/)).toMatchInlineSnapshot(`
          "import(
            /* webpackChunkName:"sharedOne" */
            '../shared/one?_lazy'
          );
          import(
            /* webpackChunkName:"sharedTwo" */
            '../shared/two?_lazy'
          );
          "
        `);

        compiler.forceCompile();
        return ModuleReplacePlugin.restoreModule('../shared/one?_lazy');
      })
      .then(stats => {
        expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
          /one.js\?_lazy/
        );
        expect(getModuleSource(stats, /\.\.\/shared\/two\?_lazy/)).toMatch(
          `testDummyComponent`
        );

        compiler.forceCompile();
        return ModuleReplacePlugin.restoreModule('../shared/two?_lazy');
      })
      .then(stats => {
        expect(getModuleSource(stats, /\.\.\/shared\/one\?_lazy/)).toMatch(
          /one.js\?_lazy/
        );
        expect(getModuleSource(stats, /\.\.\/shared\/two\?_lazy/)).toMatch(
          /two.js\?_lazy/
        );
      })
      .end(done);
  });
});
