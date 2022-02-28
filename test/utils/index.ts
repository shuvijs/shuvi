import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import Browser, { Page } from './browser';

export { Browser, Page };

export * from './fixture';
export * from './findPort';
export * from './launcher';
export * from './build';

export function wait(timeout: number) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

export function trim(s: TemplateStringsArray | string) {
  if (typeof s === 'string') {
    return s.trim().replace(/^\s+/gm, '');
  }
  return s.join('\n').trim().replace(/^\s+/gm, '');
}

export async function check<T>(
  getter: () => T | Promise<T>,
  until: (x: T) => boolean
): Promise<boolean> {
  let content: T;
  let lastErr: any;

  for (let tries = 0; tries < 30; tries++) {
    try {
      content = await getter();
      if (until(content)) {
        // found the content
        return true;
      }
      await wait(1000);
    } catch (err) {
      await wait(1000);
      lastErr = err;
    }
  }

  throw new Error('CHECK TIMED OUT: ' + lastErr);
}

export function createCliTestProject(dir: string, cwd?: string) {
  const _cwd = cwd || process.cwd();
  const projectRoot = path.resolve(_cwd, dir);

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
      const s = spawn('pnpm --', ['shuvi', command, dir, ...args], {
        ...options,
        shell: true
      });

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

export const getIframeTextContent = (page: Page) => {
  return page.evaluate(() => {
    return (
      document.querySelector('iframe')?.contentDocument?.body.innerText || ''
    );
  });
};
