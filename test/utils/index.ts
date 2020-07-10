import Browser, { Page } from './browser';
import { spawn, execSync, ExecSyncOptions } from 'child_process';

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

export function runShuviCommand(
  command: string,
  args: string[],
  options?: ExecSyncOptions
) {
  try {
    const result = execSync(`yarn shuvi ${command} ${args.join(' ')}`, {
      stdio: 'pipe',
      ...options
    });
    return result.toString();
  } catch (e) {
    throw e;
  }
}

export function runShuviCommandWithSpawn(
  command: string,
  args: string[]
): Promise<{ code: number; message: string }> {
  return new Promise((resolve, reject) => {
    let output = '';
    let err = '';
    const s = spawn('yarn', ['shuvi', command, ...args], {
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
}
