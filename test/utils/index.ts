import Browser, { Page } from './browser';
import { execSync, ExecSyncOptions } from 'child_process';

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
  const result = execSync(`yarn shuvi ${command} ${args.join(' ')}`, {
    stdio: 'pipe',
    ...options
  });
  return result.toString();
}
