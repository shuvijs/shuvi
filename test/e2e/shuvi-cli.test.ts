import * as path from 'path';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import { SpawnOptionsWithoutStdio } from 'child_process';
import { shuvi, resolveFixture } from '../utils';

jest.setTimeout(30 * 1000);

function createTestCtx(fixture: string) {
  const projectRoot = resolveFixture(fixture);

  const exist = (file: string) => {
    return fs.existsSync(path.resolve(projectRoot, file));
  };

  const clear = (file: string) => {
    return fse.removeSync(path.resolve(projectRoot, file));
  };

  const runShuviCommand = (
    command: string,
    args: string[] = [],
    options?: SpawnOptionsWithoutStdio
  ) => {
    return new Promise<{ code: number; message: string }>((resolve, reject) => {
      let output = '';
      let err = '';
      const s = shuvi(command, [projectRoot, ...args], {
        ...options
      });

      if (s.stdout === null || s.stderr === null) {
        return reject({
          code: -1,
          message: `fail to run ${command}`
        });
      }

      s.stdout.on('data', data => {
        output += data;
      });

      s.stderr.on('data', data => {
        err += data;
      });

      s.on('exit', code => {
        if (code === 0) {
          resolve({
            code,
            message: output
          });
        } else {
          reject({
            code,
            message: err
          });
        }
      });
    });
  };

  return {
    exist,
    clear,
    run: runShuviCommand
  };
}

describe('shuvi/build', () => {
  it('should generate html file to analyze webpack bundle by specify --analyze flag', async () => {
    const project = createTestCtx('shuvi-cli');
    project.clear('build');
    const { message } = await project.run('build', ['--analyze']);
    expect(project.exist('build/client/static')).toBeTruthy();
    expect(project.exist('build/analyze/server.html')).toBeTruthy();
    expect(project.exist('build/analyze/client.html')).toBeTruthy();
    expect(message).toMatch('Build successfully!');
  });

  it('should exit process when dir is not exist', async () => {
    const project = createTestCtx('xxx-none-existed-project');
    try {
      await project.run('build');
    } catch (e: any) {
      expect(e.code).toBe(1);
      expect(e.message).toMatch('No such directory exists as the project root');
    }
  });
});

describe('shuvi/inspect', () => {
  it('should be log webpack config correctly', async () => {
    try {
      const project = createTestCtx('test/fixtures/inspect');
      const { message } = await project.run('inspect', []);
      expect(message).toMatch(`mode: 'development'`);
      expect(message).toMatch(`name: 'shuvi/server'`);
      expect(message).toMatch(`name: 'shuvi/client'`);
      expect(message).not.toMatch(`__NAME__: '"shuvi/client"'`);
      expect(message).not.toMatch(`__NAME__: '"shuvi/server"'`);
    } catch (e: any) {
      expect(e.code).toBe(1);
      expect(e.message).toMatch('No such directory exists as the project root');
    }
  });

  it('can specify --mode', async () => {
    const project = createTestCtx('shuvi-cli');
    const { message } = await project.run('inspect', ['--mode=production']);
    expect(message).toMatch(`mode: 'production'`);
    expect(message).toMatch(`name: 'shuvi/server'`);
    expect(message).toMatch(`name: 'shuvi/client'`);
  });

  it('can specify --verbose', async () => {
    const project = createTestCtx('shuvi-cli');
    const { message } = await project.run('inspect', ['--verbose']);
    expect(message).toMatch(
      `definitions: {
        'process.env.NODE_ENV': '\"development\"',
        __BROWSER__: false,
        'typeof window': '\"undefined\"'
      }`
    );

    const project2 = createTestCtx('shuvi-cli');
    const { message: message2 } = await project2.run('inspect', [
      '--mode=production',
      '--verbose'
    ]);
    expect(message2).toMatch(
      `definitions: {
        'process.env.NODE_ENV': '\"production\"',
        __BROWSER__: false,
        'typeof window': '\"undefined\"'
      }`
    );
  });
});
