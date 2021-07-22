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

    app.addEntryCode('run()');
    app.setRoutesContent('routes content');
    app.addPolyfill('path/toPolyfill');
    app.addService('something to export', '*', 'services/something', false);

    await app.build(BUILD_DIR);

    checkMatch([
      ['main.client.js', /run()/],
      ['services/something.js', 'export * from "something to export"'],
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
    app.addService('something to export', '*', 'services/something', false);

    await app.build(BUILD_DIR);

    checkMatch([
      ['main.client.js', /run()/],
      ['services/something.js', 'export * from "something to export"'],
      ['test.js', 'export default () => "test page"'],
      ['core/polyfill.js', 'import "path/toPolyfill"'],
      ['core/routes.js', 'routes content']
    ]);

    // Change modules and content
    app.addEntryCode('const a = 1');
    app.addPolyfill('path/toPolyfill2');
    app.setRoutesContent('routes content 2');
    app.addService('export2', '*', 'services/export2', false);

    await wait(0);

    checkMatch([
      ['main.client.js', /run().*const a=1/s],
      ['services/something.js', 'export * from "something to export"'],
      ['services/export2.js', 'export * from "export2"'],
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
    app.addService('something to export', '*', 'services/something', true);
    app.addPolyfill('path/toPolyfill');

    await app.build(BUILD_DIR);

    checkMatch([
      ['services/something.ts', 'export * from "something to export"'],
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
});
