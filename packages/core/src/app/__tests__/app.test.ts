import { App } from '../app';
import path from 'path';
import { createFile } from '../models/files';
import { readFileSync, existsSync } from 'fs';
import { removeSync } from 'fs-extra';

function resolveFixture(...paths: string[]) {
  return path.join(__dirname, 'fixtures', ...paths);
}

describe('app', () => {
  describe('build', () => {
    const app = new App();

    const dirOption = {
      dir: resolveFixture('basic-build'),
    };

    afterAll(() => {
      removeSync(dirOption.dir);
    });

    test('should work', async (done) => {
      app.addFile(
        createFile('test.js', { content: 'export default () => "test page"' })
      );

      app.setRoutesContent('routes content');
      app.setAppModule('appModules');
      app.setBootstrapModule('bootstrapModules');
      app.addExport('something to export', '*');
      app.addPolyfill('path/toPolyfill');

      await app.build(dirOption);

      const filesToTest = [
        ['index.js', 'export * from "something to export"'],
        ['test.js', 'export default () => "test page"'],
        ['core/app.js', 'import temp from "appModules"\nexport default temp'],
        ['core/bootstrap.js', 'export * from "bootstrapModules"'],
        ['core/polyfill.js', 'import "path/toPolyfill"'],
        ['core/routes.js', 'routes content'],
      ];

      filesToTest.forEach(([file, expected]) => {
        expect({
          [file]: readFileSync(resolveFixture('basic-build', file), 'utf8'),
        }).toStrictEqual({ [file]: expected });
      });

      // Change modules and content
      app.addPolyfill('path/toPolyfill2');
      app.setRoutesContent('routes content 2');
      app.setAppModule('123');
      app.setBootstrapModule('bootstrapModules2');
      app.addExport('export2', '*');

      const filesToBeUpdated = [
        [
          'index.js',
          'export * from "something to export"\nexport * from "export2"',
        ],
        ['test.js', 'export default () => "test page"'],
        ['core/app.js', 'import temp from "123"\nexport default temp'],
        ['core/bootstrap.js', 'export * from "bootstrapModules2"'],
        [
          'core/polyfill.js',
          'import "path/toPolyfill"\nimport "path/toPolyfill2"',
        ],
        ['core/routes.js', 'routes content 2'],
      ];

      filesToBeUpdated.forEach(([file, result]) => {
        expect(readFileSync(resolveFixture('basic-build', file), 'utf8')).toBe(
          result
        );
      });

      app.stopBuild(dirOption.dir);
      expect(existsSync(resolveFixture('basic-build', 'index.js'))).toBe(false);
      done();
    });
  });

  describe('build once', () => {
    const app = new App();

    const dirOption = {
      dir: resolveFixture('basic-build-once'),
    };

    afterAll(() => {
      removeSync(dirOption.dir);
    });

    test('should work', async (done) => {
      app.addFile(
        createFile('test.js', { content: 'export default () => "test page"' })
      );

      app.setRoutesContent('routes content');
      app.setAppModule('appModules');
      app.setBootstrapModule('bootstrapModules');
      app.addExport('something to export', '*');
      app.addPolyfill('path/toPolyfill');

      await app.buildOnce(dirOption);

      const filesToTest = [
        ['index.js', 'export * from "something to export"'],
        ['test.js', 'export default () => "test page"'],
        ['core/app.js', 'import temp from "appModules"\nexport default temp'],
        ['core/bootstrap.js', 'export * from "bootstrapModules"'],
        ['core/polyfill.js', 'import "path/toPolyfill"'],
        ['core/routes.js', 'routes content'],
      ];

      filesToTest.forEach(([file, result]) => {
        expect(
          readFileSync(resolveFixture('basic-build-once', file), 'utf8')
        ).toBe(result);
      });

      // should not make changes after build
      app.setRoutesContent('other content');

      expect(
        readFileSync(
          resolveFixture('basic-build-once', 'core/routes.js'),
          'utf8'
        )
      ).toBe('routes content');

      done();
    });
  });
});
