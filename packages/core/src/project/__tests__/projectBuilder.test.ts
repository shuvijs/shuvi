import path from 'path';
import { removeSync } from 'fs-extra';
import { readFileSync, existsSync } from 'fs';
import { ProjectBuilder } from '../projectBuilder';
import { wait } from 'shuvi-test-utils';

type TestRule = [string, string | RegExp];

let app: ProjectBuilder;

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
  app = new ProjectBuilder();
});

afterEach(async () => {
  await app.stopBuild();
  removeSync(BUILD_DIR);
});

describe('app', () => {
  test('should work', async () => {
    app.addFile({
      name: 'test.js',
      content: () => 'export default () => "test page"'
    });

    app.setEntryFileContent('import "entry.js"');
    app.addEntryCode('run()');
    app.setRoutesContent('routes content');
    app.setAppModule('appModules');
    app.setViewModule('viewModules');
    app.addPolyfill('path/toPolyfill');
    app.addExport('something to export', '*');

    await app.build(BUILD_DIR);

    checkMatch([
      ['entry.js', 'import "entry.js"'],
      ['entryContents.js', /run()/],
      ['index.js', 'export * from "something to export"'],
      ['test.js', 'export default () => "test page"'],
      ['core/app.js', 'import temp from "appModules"\nexport default temp'],
      ['platform/view.js', 'import temp from "viewModules"\nexport default temp'],
      ['core/polyfill.js', 'import "path/toPolyfill"'],
      ['core/routes.js', 'routes content']
    ]);
  });

  test('should reactive to state change', async () => {
    app.addFile({
      name: 'test.js',
      content: () => 'export default () => "test page"'
    });

    app.setEntryFileContent('import "entry.js"');
    app.addEntryCode('run()');
    app.setRoutesContent('routes content');
    app.setAppModule('appModules');
    app.setViewModule('viewModules');
    app.addPolyfill('path/toPolyfill');
    app.addExport('something to export', '*');

    await app.build(BUILD_DIR);

    checkMatch([
      ['entry.js', 'import "entry.js"'],
      ['entryContents.js', /run()/],
      ['index.js', 'export * from "something to export"'],
      ['test.js', 'export default () => "test page"'],
      ['core/app.js', 'import temp from "appModules"\nexport default temp'],
      ['platform/view.js', 'import temp from "viewModules"\nexport default temp'],
      ['core/polyfill.js', 'import "path/toPolyfill"'],
      ['core/routes.js', 'routes content']
    ]);

    // Change modules and content
    app.setEntryFileContent('import "other_entry.js"');
    app.addEntryCode('const a = 1');
    app.addPolyfill('path/toPolyfill2');
    app.setRoutesContent('routes content 2');
    app.setAppModule('123');
    app.setViewModule('viewModules2');
    app.addExport('export2', '*');

    await wait(0);

    checkMatch([
      ['entry.js', 'import "other_entry.js"'],
      ['entryContents.js', /run().*const a=1/s],
      [
        'index.js',
        'export * from "something to export"\nexport * from "export2"'
      ],
      ['test.js', 'export default () => "test page"'],
      ['core/app.js', 'import temp from "123"\nexport default temp'],
      ['platform/view.js', 'import temp from "viewModules2"\nexport default temp'],
      [
        'core/polyfill.js',
        'import "path/toPolyfill"\nimport "path/toPolyfill2"'
      ],
      ['core/routes.js', 'routes content 2']
    ]);

    await app.stopBuild();
    expect(existsSync(resolveBuildFile('index.js'))).toBe(false);
  });

  test('build once', async () => {
    app = new ProjectBuilder({ static: true });
    app.addFile({
      name: 'test.js',
      content: () => 'export default () => "test page"'
    });

    app.setRoutesContent('routes content');
    app.setAppModule('appModules');
    app.setViewModule('viewModules');
    app.addExport('something to export', '*');
    app.addPolyfill('path/toPolyfill');

    await app.build(BUILD_DIR);

    checkMatch([
      ['index.js', 'export * from "something to export"'],
      ['test.js', 'export default () => "test page"'],
      ['core/app.js', 'import temp from "appModules"\nexport default temp'],
      ['platform/view.js', 'import temp from "viewModules"\nexport default temp'],
      ['core/polyfill.js', 'import "path/toPolyfill"'],
      ['core/routes.js', 'routes content']
    ]);

    // should not make changes after build
    app.setRoutesContent('other content');

    await wait(0);

    expect(readFileSync(resolveBuildFile('core/routes.js'), 'utf8')).toBe(
      'routes content'
    );
  });
});
