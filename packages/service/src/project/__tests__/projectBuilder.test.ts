import * as path from 'path';
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
    app.addRuntimeService('something to export', '*');

    await app.build(BUILD_DIR);

    checkMatch([
      ['runtime/index.js', 'export * from "something to export"'],
      ['test.js', 'export default () => "test page"']
    ]);
  });

  test('should reactive to state change', async () => {
    app.addFile({
      name: 'test.js',
      content: () => 'export default () => "test page"'
    });

    app.addRuntimeService('something to export', '*');

    await app.build(BUILD_DIR);

    checkMatch([
      ['runtime/index.js', 'export * from "something to export"'],
      ['test.js', 'export default () => "test page"']
    ]);

    // Change modules and content
    app.addRuntimeService('export2', '*');

    await wait(0);

    checkMatch([
      [
        'runtime/index.js',
        'export * from "something to export"\nexport * from "export2"'
      ],
      ['test.js', 'export default () => "test page"']
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

    app.addRuntimeService('something to export', '*');

    await app.build(BUILD_DIR);

    checkMatch([
      ['runtime/index.js', 'export * from "something to export"'],
      ['test.js', 'export default () => "test page"']
    ]);
  });

  describe('addRuntimeService', () => {
    test('should work', async () => {
      app = new ProjectBuilder({ static: false });
      app.addRuntimeService('source', 'exported', 'a.js');
      app.addRuntimeService('source', 'exported', 'a.ts');
      app.addRuntimeService('source', 'exported0', 'b.js');
      app.addRuntimeService('source', 'exported1', 'b.js');

      await app.build(BUILD_DIR);

      checkMatch([
        ['runtime/a.js', 'export exported from "source"'],
        ['runtime/a.ts', 'export exported from "source"'],
        [
          'runtime/b.js',
          [
            'export exported0 from "source"',
            'export exported1 from "source"'
          ].join('\n')
        ]
      ]);

      app.addRuntimeService('source', 'exported2', 'b.js');

      await wait(0);

      checkMatch([
        [
          'runtime/b.js',
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
