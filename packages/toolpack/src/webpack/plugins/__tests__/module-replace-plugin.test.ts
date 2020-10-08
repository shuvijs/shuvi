import ModuleReplacePlugin from '../module-replace-plugin';
import { resolveFixture } from './utils';
import { watchCompiler, getModuleSource } from './helpers/webpack';

describe('module-replace-plugin', () => {
  test.only('basic', done => {
    const compiler = watchCompiler({
      mode: 'development',
      entry: resolveFixture('module-replace'),
      plugins: [
        new ModuleReplacePlugin({
          modules: [
            {
              test: /\?_lazy/,
              module: require.resolve('./fixtures/testDummyComponent')
            }
          ]
        })
      ]
    });

    compiler
      .waitForCompile(stats => {
        // expect(getModuleSource(stats, /one\.js/)).toMatch(`testDummyComponent`);
        // expect(getModuleSource(stats, /two\.js/)).toMatch(`testDummyComponent`);
        // expect(getModuleSource(stats, /module-replace/)).toMatchInlineSnapshot(`
        //   "import(
        //     /* webpackChunkName:\\"sharedOne\\" */
        //     '../shared/one?_lazy'
        //   );
        //   import(
        //     /* webpackChunkName:\\"sharedTwo\\" */
        //     '../shared/two?_lazy'
        //   );
        //   "
        // `);

        compiler.forceCompile();
        return ModuleReplacePlugin.restoreModule('../shared/one?_lazy');
      })
      .then(stats => {
        // expect(getModuleSource(stats, /one\.js/)).toMatch(`export default 1;`);
        // expect(getModuleSource(stats, /two\.js/)).toMatch(`testDummyComponent`);

        compiler.forceCompile();
        return ModuleReplacePlugin.restoreModule('../shared/two?_lazy');
      })
      .then(stats => {
        expect(getModuleSource(stats, /one\.js/)).toMatch(`export default 1;`);
        expect(getModuleSource(stats, /two\.js/)).toMatch(`export default 2;`);
      })
      .end(done);
  });
});
