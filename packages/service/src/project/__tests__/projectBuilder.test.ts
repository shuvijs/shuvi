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

describe('projectBuilder', () => {
  test('should work', async () => {
    app.addFile({
      name: 'test.js',
      content: () => 'export default () => "test page"'
    });

    app.addEntryCode('run()');
    app.setRoutesContent('routes content');
    app.addPolyfill('path/toPolyfill');
    app.addExport('something to export', '*');

    await app.build(BUILD_DIR);

    checkMatch([
      ['entry.client.js', /run()/],
      ['index.js', 'export * from "something to export"'],
      ['test.js', 'export default () => "test page"'],
      ['core/polyfill.js', 'import "path/toPolyfill"'],
      ['core/routes.js', 'routes content']
    ]);
  });

  test('should reactive to state change', async () => {
    app.addFile({
      name: 'test.js',
      content: () => 'export default () => "test page"'
    });

    app.addEntryCode('run()');
    app.setRoutesContent('routes content');
    app.addPolyfill('path/toPolyfill');
    app.addExport('something to export', '*');

    await app.build(BUILD_DIR);

    checkMatch([
      ['entry.client.js', /run()/],
      ['index.js', 'export * from "something to export"'],
      ['test.js', 'export default () => "test page"'],
      ['core/polyfill.js', 'import "path/toPolyfill"'],
      ['core/routes.js', 'routes content']
    ]);

    // Change modules and content
    app.addEntryCode('const a = 1');
    app.addPolyfill('path/toPolyfill2');
    app.setRoutesContent('routes content 2');
    app.addExport('export2', '*');

    await wait(0);

    checkMatch([
      ['entry.client.js', /run().*const a=1/s],
      [
        'index.js',
        'export * from "something to export"\nexport * from "export2"'
      ],
      ['test.js', 'export default () => "test page"'],
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
    app.addExport('something to export', '*');
    app.addPolyfill('path/toPolyfill');

    await app.build(BUILD_DIR);

    checkMatch([
      ['index.js', 'export * from "something to export"'],
      ['test.js', 'export default () => "test page"'],
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

  describe('addService', () => {
    test('should work', async () => {
      app = new ProjectBuilder({ static: false });
      app.addService('source', 'exported', 'services/a.js');
      app.addService('source', 'exported', 'services/a.ts');
      app.addService('source', 'exported0', 'services/b.js');
      app.addService('source', 'exported1', 'services/b.js');

      await app.build(BUILD_DIR);

      checkMatch([
        ['services/a.js', 'export exported from "source"'],
        ['services/a.ts', 'export exported from "source"'],
        [
          'services/b.js',
          [
            'export exported0 from "source"',
            'export exported1 from "source"'
          ].join('\n')
        ]
      ]);

      app.addService('source', 'exported2', 'services/b.js');

      await wait(0);

      checkMatch([
        [
          'services/b.js',
          [
            'export exported0 from "source"',
            'export exported1 from "source"',
            'export exported2 from "source"'
          ].join('\n')
        ]
      ]);
    });
  });
});
