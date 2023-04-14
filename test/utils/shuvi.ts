import { spawn, sync } from 'cross-spawn';
import { SpawnOptions, ChildProcess, SpawnSyncReturns } from 'child_process';
import { IBuildOptions, build as shuviBuild } from 'shuvi/lib/tasks/build';

export async function build(options: IBuildOptions) {
  return await shuviBuild(options);
}

export function shuvi(
  command: 'dev' | 'build' | 'serve' | 'inspect' | string,
  args: string[],
  options: SpawnOptions = {}
): ChildProcess {
  const isDev = command === 'dev';

  const shuviCmd = require.resolve('shuvi/bin/cli');

  const p = spawn('node', [shuviCmd, command, ...args], {
    ...options,
    env: {
      ...process.env,
      NODE_ENV: isDev ? 'development' : 'production',
      ...options.env,
      // forbid to overwrite PATH
      PATH: process.env.PATH
    }
  });
  return p;
}

export function shuviSync(
  command: 'dev' | 'build' | 'start',
  args: string[],
  options: SpawnOptions = {}
): SpawnSyncReturns<string> {
  const isDev = command === 'dev';

  const shuviCmd = require.resolve('shuvi/bin/cli');

  const r = sync('node', [shuviCmd, command, ...args], {
    ...options,
    encoding: 'utf8',
    env: {
      ...process.env,
      NODE_ENV: isDev ? 'development' : 'production',
      ...options.env,
      // forbid to overwrite PATH
      PATH: process.env.PATH
    }
  });

  return r;
}
