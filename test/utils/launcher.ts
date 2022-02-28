import qs from 'querystring';
import { IApiConfig } from '@shuvi/types';
import { shuvi, Shuvi } from 'shuvi';
import { loadFixture, resolveFixture } from './fixture';
import { build } from './build';
import { findPort } from './findPort';
import Browser from './browser';
import { spawn, sync } from 'cross-spawn';
import { SpawnOptions, ChildProcess } from 'child_process';
import rimraf from 'rimraf';

export { Shuvi };

export interface AppCtx {
  browser: Browser;
  url: (x: string, query?: Record<string, any>) => string;
  close(): Promise<void>;
}

async function createTextContext(app: Shuvi): Promise<AppCtx> {
  const port = await findPort();
  await app.listen(port);
  const browser = new Browser();
  await browser.start();

  const url = (route: string, query?: Record<string, any>) => {
    const path = 'http://localhost:' + port + route;
    if (query) {
      return path + '?' + qs.stringify(query);
    } else {
      return path;
    }
  };

  return {
    browser,
    url,
    async close() {
      await Promise.all([app.close(), browser.close()]);
    }
  };
}

export async function launchFixtureAtCurrentProcess(
  name: string,
  overrides: Partial<IApiConfig> = {}
): Promise<AppCtx> {
  const config = await loadFixture(name, overrides);
  const shuviApp = shuvi({ dev: true, config });
  return await createTextContext(shuviApp);
}

export async function serveFixtureAtCurrentProcess(
  name: string,
  overrides: Partial<IApiConfig> = {}
): Promise<AppCtx> {
  const config = await loadFixture(name, overrides);
  await build({ config });
  const shuviApp = shuvi({ dev: false, config });
  return createTextContext(shuviApp);
}

async function launchShuvi(
  path: string,
  port: number,
  isDev: boolean,
  configOverrides: Partial<IApiConfig>,
  envOverrides: Partial<NodeJS.ProcessEnv>
): Promise<ChildProcess> {
  return new Promise(resolve => {
    const spawnOptions: SpawnOptions = {
      env: {
        NODE_ENV: isDev ? 'development' : 'production',
        PATH: process.env.PATH
      }
    };
    if (envOverrides) {
      Object.assign(spawnOptions.env, envOverrides);
    }
    const cliAgent = require.resolve('shuvi/lib/cli/agent');
    const getCliCommand = (command: string) =>
      require.resolve('shuvi/lib/cli/cmds/' + command);
    // At first, build when production mode
    if (!isDev) {
      sync('node', [cliAgent, getCliCommand('build'), path], spawnOptions);
    }
    const shuviProcess: ChildProcess = spawn(
      'node',
      [
        cliAgent,
        getCliCommand(isDev ? 'dev' : 'serve'),
        path,
        '--port',
        String(port),
        '--config-overrides',
        JSON.stringify(configOverrides)
      ],
      spawnOptions
    );
    if (shuviProcess.stdout) {
      shuviProcess.stdout.setEncoding('utf-8');
      shuviProcess.stdout.on('data', (data: string) => {
        // Attention!
        // Through stdio stream, a '\n' would be appended to every `console.log` output.
        // Multiple `console.log` output might be merged into one emitting.
        // In this case, it will be a little more complex to spy on `console.log`.
        console.log(data);
        // We could only listen to the console output to ensure that devServer is ready
        if (data.includes('Ready on')) {
          resolve(shuviProcess);
        }
      });
    }
    if (shuviProcess.stderr) {
      shuviProcess.stderr.setEncoding('utf-8');
      shuviProcess.stderr.on('data', data => {
        console.error(data);
      });
    }
  });
}

export async function launchFixture(
  name: string,
  configOverrides: Partial<IApiConfig> = {},
  envOverrides: Partial<NodeJS.ProcessEnv> = {},
  isDev: boolean = true
) {
  const path = resolveFixture(name);
  // remove generated files under '.shuvi' and 'dist' folders to prevent unexpected effect
  rimraf.sync(resolveFixture(name, '.shuvi'));
  rimraf.sync(resolveFixture(name, 'dist'));
  const port = await findPort();
  const shuviProcess = await launchShuvi(
    path,
    port,
    isDev,
    configOverrides,
    envOverrides
  );
  const browser = new Browser();
  await browser.start();
  const url = (route: string, query?: Record<string, any>) => {
    const path = 'http://localhost:' + port + route;
    if (query) {
      return path + '?' + qs.stringify(query);
    } else {
      return path;
    }
  };
  return {
    browser,
    url,
    async close() {
      await Promise.all([shuviProcess.kill(), browser.close()]);
    }
  };
}

export async function serveFixture(
  name: string,
  configOverrides: Partial<IApiConfig> = {},
  envOverrides: Partial<NodeJS.ProcessEnv> = {}
): Promise<AppCtx> {
  return await launchFixture(name, configOverrides, envOverrides, false);
}
