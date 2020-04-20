import ModuleReplacePlugin from '../module-replace-plugin';
import { resolveFixture } from './utils';
import webpack, { Configuration, Stats } from 'webpack';
import { watchCompiler } from './helpers/runCompiler';

describe('module-replace-plugin', () => {
  test('basic', async (done) => {
    let onChange = step1;
    const webpackConfig = require(resolveFixture('basic', 'webpack.config.js'));

    const compiler = webpack({
      ...webpackConfig,
      mode: 'development',
      plugins: [
        new ModuleReplacePlugin({
          modules: [
            {
              test: /main/,
              module: require.resolve('./fixtures/testDummyComponent'),
            },
          ],
        }),
      ],
    } as Configuration);

    const watcher = await watchCompiler(compiler, (err, stats) => {
      onChange(stats);
    });

    function step1(stats: Stats) {
      const result = stats.toJson();

      expect(result.modules?.length).toBe(2);

      expect(result.modules?.[0].source).toContain(
        resolveFixture('testDummyComponent.js')
      );
      expect(result.modules?.[1].source).toMatchInlineSnapshot(`
      "export default function () {
        return 'Dummy';
      }
      "
    `);
      onChange = step2;
    }

    function step2(stats: Stats) {
      const result = stats.toJson();

      expect(result.modules?.length).toBe(3);
      expect(result.modules?.[0].source).toMatchInlineSnapshot(`
      "export default 1;
      "
    `);
      expect(result.modules?.[1].source).toMatchInlineSnapshot(`
      "export default 2;
      "
    `);
      expect(result.modules?.[2].source).toMatchInlineSnapshot(`
      "import(
        /* webpackChunkName:\\"helperOne\\" */
        './helpers/one'
      );
      import(
        /* webpackChunkName:\\"helperTwo\\" */
        './helpers/two'
      );
      "
    `);

      watcher.close(() => {
        setTimeout(done, 500);
      });
    }

    // call restoreModule
    ModuleReplacePlugin.restoreModule(resolveFixture('basic', 'main.js'));

    // recompile
    watcher.invalidate();
  }, 5000);
});
