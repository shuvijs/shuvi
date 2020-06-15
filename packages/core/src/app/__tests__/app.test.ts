import path from 'path';
import { removeSync } from 'fs-extra';
import { readFileSync, existsSync } from 'fs';
import { App } from '../app';
import { createFile } from '../models/files';

type TestRule = [string, string | RegExp];

let app: App;

const BUILD_DIR = path.join(__dirname, 'fixtures', 'app-build');

function resolveBuildFile(...paths: string[]) {
  return path.join(BUILD_DIR, ...paths);
}

function checkMatch(tests: TestRule[]) {
  tests.forEach(([file, expected]) => {
    if (typeof expected === 'string') {
      expect(readFileSync(resolveBuildFile(file), 'utf8')).toBe(expected);
    } else {
      expect(readFileSync(resolveBuildFile(file), 'utf8')).toMatch(expected);
    }
  });
}

beforeEach(() => {
  app = new App();
});

afterEach(() => {
  app.stopBuild(BUILD_DIR);
  removeSync(BUILD_DIR);
});

describe('app', () => {
  test('should work', async () => {
    app.addFile(
      createFile('test.js', { content: 'export default () => "test page"' })
    );

    app.addEntryCode('run()');
    app.setRoutesContent('routes content');
    app.setAppModule('appModules');
    app.setRendererModule('rendererModules');
    app.addPolyfill('path/toPolyfill');
    app.addExport('something to export', '*');
    app.addRuntimePlugin('plugin1', 'path/toPlugin');

    await app.build({
      dir: BUILD_DIR
    });

    checkMatch([
      ['entry.js', /run()/],
      ['index.js', 'export * from "something to export"'],
      ['test.js', 'export default () => "test page"'],
      ['core/app.js', 'import temp from "appModules"\nexport default temp'],
      ['core/renderer.js', 'export * from "rendererModules"'],
      ['core/polyfill.js', 'import "path/toPolyfill"'],
      ['core/routes.js', 'routes content'],
      [
        'core/plugins.js',
        'import plugin1 from "path/toPlugin"\nexport default (application) => {\nplugin1(application)\n}'
      ]
    ]);
  });

  test('should reactive to state change', async () => {
    app.addFile(
      createFile('test.js', { content: 'export default () => "test page"' })
    );

    app.addEntryCode('run()');
    app.setRoutesContent('routes content');
    app.setAppModule('appModules');
    app.setRendererModule('rendererModules');
    app.addPolyfill('path/toPolyfill');
    app.addExport('something to export', '*');
    app.addRuntimePlugin('plugin1', 'path/toPlugin');

    await app.build({
      dir: BUILD_DIR
    });

    checkMatch([
      ['entry.js', /run()/],
      ['index.js', 'export * from "something to export"'],
      ['test.js', 'export default () => "test page"'],
      ['core/app.js', 'import temp from "appModules"\nexport default temp'],
      ['core/renderer.js', 'export * from "rendererModules"'],
      ['core/polyfill.js', 'import "path/toPolyfill"'],
      ['core/routes.js', 'routes content'],
      [
        'core/plugins.js',
        'import plugin1 from "path/toPlugin"\nexport default (application) => {\nplugin1(application)\n}'
      ]
    ]);

    // Change modules and content
    app.addEntryCode('const a = 1');
    app.addPolyfill('path/toPolyfill2');
    app.setRoutesContent('routes content 2');
    app.setAppModule('123');
    app.setRendererModule('rendererModules2');
    app.addExport('export2', '*');
    app.addRuntimePlugin('plugin2', 'path/toPlugin2');

    checkMatch([
      ['entry.js', /run().*const a=1/s],
      [
        'index.js',
        'export * from "something to export"\nexport * from "export2"'
      ],
      ['test.js', 'export default () => "test page"'],
      ['core/app.js', 'import temp from "123"\nexport default temp'],
      ['core/renderer.js', 'export * from "rendererModules2"'],
      [
        'core/polyfill.js',
        'import "path/toPolyfill"\nimport "path/toPolyfill2"'
      ],
      ['core/routes.js', 'routes content 2'],
      [
        'core/plugins.js',
        'import plugin1 from "path/toPlugin"\nimport plugin2 from "path/toPlugin2"\nexport default (application) => {\nplugin1(application)\nplugin2(application)\n}'
      ]
    ]);

    app.stopBuild(BUILD_DIR);
    expect(existsSync(resolveBuildFile('index.js'))).toBe(false);
  });

  test('build once', async () => {
    app.addFile(
      createFile('test.js', { content: 'export default () => "test page"' })
    );

    app.setRoutesContent('routes content');
    app.setAppModule('appModules');
    app.setRendererModule('rendererModules');
    app.addExport('something to export', '*');
    app.addPolyfill('path/toPolyfill');

    await app.buildOnce({
      dir: BUILD_DIR
    });

    checkMatch([
      ['index.js', 'export * from "something to export"'],
      ['test.js', 'export default () => "test page"'],
      ['core/app.js', 'import temp from "appModules"\nexport default temp'],
      ['core/renderer.js', 'export * from "rendererModules"'],
      ['core/polyfill.js', 'import "path/toPolyfill"'],
      ['core/routes.js', 'routes content'],
      ['core/plugins.js', 'export default (application) => {\n}']
    ]);

    // should not make changes after build
    app.setRoutesContent('other content');

    expect(readFileSync(resolveBuildFile('core/routes.js'), 'utf8')).toBe(
      'routes content'
    );
  });
});
