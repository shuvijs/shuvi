import * as qs from 'querystring';
import { createShuviServer, IShuviServer } from '@shuvi/service';
import { ShuviConfig } from 'shuvi/lib';
import { initShuvi } from 'shuvi/lib/shuvi';
import { loadFixture, resolveFixture } from './fixture';
import { shuviSync, shuvi, build } from './shuvi';
import { findPort } from './findPort';
import Browser from './browser';
import { spawn } from 'cross-spawn';
import { SpawnOptions, ChildProcess } from 'child_process';
import * as rimraf from 'rimraf';
import * as path from 'path';

export interface AppCtx {
  browser: Browser;
  url: (x: string, query?: Record<string, any>) => string;
  close(): Promise<void>;
}

async function createTestContext(app: IShuviServer): Promise<AppCtx> {
  const port = await findPort();
  await app.listen(port);
  const browser = new Browser();
  await browser.start();

  const url = (route: string, query?: Record<string, any>) => {
    const urlPath = 'http://localhost:' + port + route;
    if (query) {
      return urlPath + '?' + qs.stringify(query);
    } else {
      return urlPath;
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

export function buildFixture(
  fixture: string,
  configOverrides: ShuviConfig = {},
  spawnOptions: SpawnOptions = {}
) {
  return shuviSync(
    'build',
    [
      path.isAbsolute(fixture) ? fixture : resolveFixture(fixture),
      '--config-overrides',
      JSON.stringify(configOverrides)
    ],
    spawnOptions
  );
}

export async function launchFixtureAtCurrentProcess(
  name: string,
  overrides: ShuviConfig = {}
): Promise<AppCtx> {
  const config = await loadFixture(name, overrides);
  const api = await initShuvi({ cwd: resolveFixture(name), config });
  await api.buildApp();
  const shuviApp = await createShuviServer({
    context: api.pluginContext,
    dev: true,
    ...api.serverConfigs
  });
  return await createTestContext(shuviApp);
}

export async function serveFixtureAtCurrentProcess(
  name: string,
  overrides: ShuviConfig = {}
): Promise<AppCtx> {
  const config = await loadFixture(name, overrides);
  const api = await build({
    cwd: resolveFixture(name),
    config
  });
  const shuviApp = await createShuviServer({
    context: api.pluginContext,
    ...api.serverConfigs
  });
  return createTestContext(shuviApp);
}

interface IHandleStdoutStderr {
  onStdout?: (data: string) => void;
  onStderr?: (error: string) => void;
}

async function launchShuvi(
  projectPath: string,
  port: number,
  isDev: boolean,
  configOverrides: ShuviConfig,
  envOverrides: Partial<NodeJS.ProcessEnv>,
  handleStdoutStderr: IHandleStdoutStderr
): Promise<ChildProcess> {
  return new Promise(resolve => {
    // dynamic NODE_SERVER like EXPRESS, KOA default SHUVI
    const NODE_SERVER = process.env.NODE_SERVER;
    const spawnOptions: SpawnOptions = {
      env: {} as any
    };
    if (envOverrides) {
      Object.assign(spawnOptions.env!, envOverrides);
    }
    // At first, build when production mode
    if (!isDev) {
      buildFixture(projectPath, configOverrides, spawnOptions);
    }
    let shuviProcess: ChildProcess;
    if (NODE_SERVER) {
      let NODE_SERVER_SOURCE;
      try {
        NODE_SERVER_SOURCE = path.resolve(
          projectPath,
          NODE_SERVER.toLocaleLowerCase()
        );
      } catch (error) {
        throw error;
      }

      shuviProcess = spawn('node', [NODE_SERVER_SOURCE], {
        env: {
          ...process.env,
          ...spawnOptions.env,
          PORT: String(port),
          PATH: process.env.PATH
        }
      } as SpawnOptions);
    } else {
      shuviProcess = shuvi(
        isDev ? 'dev' : 'serve',
        [
          projectPath,
          '--port',
          String(port),
          '--config-overrides',
          JSON.stringify(configOverrides)
        ],
        spawnOptions
      );
    }
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
        handleStdoutStderr.onStdout && handleStdoutStderr.onStdout(data);
      });
    }
    if (shuviProcess.stderr) {
      shuviProcess.stderr.setEncoding('utf-8');
      shuviProcess.stderr.on('data', data => {
        console.error(data);
        handleStdoutStderr.onStderr && handleStdoutStderr.onStderr(data);
      });
    }
  });
}

export async function launchFixture(
  name: string,
  configOverrides: ShuviConfig = {},
  envOverrides: Partial<NodeJS.ProcessEnv> = {},
  isDev: boolean = true,
  handleStdoutStderr: IHandleStdoutStderr = {}
) {
  const projectPath = resolveFixture(name);
  // remove generated files under '.shuvi' and 'dist' folders to prevent unexpected effect
  rimraf.sync(resolveFixture(name, '.shuvi'));
  rimraf.sync(resolveFixture(name, 'dist'));
  const port = await findPort();
  const shuviProcess = await launchShuvi(
    projectPath,
    port,
    isDev,
    configOverrides,
    envOverrides,
    handleStdoutStderr
  );
  const browser = new Browser();
  await browser.start();
  const url = (route: string, query?: Record<string, any>) => {
    const urlPath = 'http://localhost:' + port + route;
    if (query) {
      return urlPath + '?' + qs.stringify(query);
    } else {
      return urlPath;
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
  configOverrides: ShuviConfig = {},
  envOverrides: Partial<NodeJS.ProcessEnv> = {},
  handleStdoutStderr: IHandleStdoutStderr = {}
): Promise<AppCtx> {
  return await launchFixture(
    name,
    configOverrides,
    envOverrides,
    false,
    handleStdoutStderr
  );
}
