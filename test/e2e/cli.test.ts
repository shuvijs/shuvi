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

  const runCommand = (
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
    run: runCommand
  };
}

describe('shuvi lint', () => {
  let message = '';

  beforeAll(async () => {
    const project = createTestCtx('eslint');
    try {
      await project.run('lint');
    } catch (error) {
      console.log('error: ', error);
      message = (error as { message: string }).message;
    }
  });

  it('should tip no-html-link-for-pages', async () => {
    expect(message).toMatch('./src/routes/page.js');
    expect(message).toMatch(
      'Error: Do not use an `<a>` element to navigate to `/other/`. Use `<Link />` from `shuvi/runtime` instead.'
    );
  });

  it('should tip page typo', async () => {
    expect(message).toMatch('./src/routes/page.js');
    expect(message).toMatch('Error: loaders may be a typo.');
  });

  it('should tip src/app typo', async () => {
    expect(message).toMatch('./src/app.js');
    expect(message).toMatch('Error: inits may be a typo.');
    expect(message).toMatch('Error: appContexts may be a typo.');
    expect(message).toMatch('Error: appComponents may be a typo.');
    expect(message).toMatch('Error: disposes may be a typo.');
  });

  it('should tip src/server typo', async () => {
    expect(message).toMatch('./src/server.js');
    expect(message).toMatch('Error: getPageDatas may be a typo.');
    expect(message).toMatch('Error: handlePageRequests may be a typo.');
    expect(message).toMatch('Error: modifyHtmls may be a typo.');
    expect(message).toMatch('Error: sendHtmls may be a typo.');
  });
});
