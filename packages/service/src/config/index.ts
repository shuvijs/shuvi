import path from 'path';
import { existsSync } from 'fs';
import { CommanderStatic } from 'commander';
import { IApiConfig } from '../api';
import { PUBLIC_PATH, CONFIG_FILE } from '../constants';
import { loadDotenvConfig } from './loadDotenvConfig';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';

export type IConfig = Partial<IApiConfig>;

export interface LoadConfigOptions {
  rootDir?: string;
  configFile?: string;
  overrides?: IConfig;
}

function getProjectDir(cmd: CommanderStatic | Record<string, any>): string {
  const dir = path.resolve(cmd.args[0] || '.');
  if (!existsSync(dir)) {
    console.error(`> No such directory exists as the project root: ${dir}`);
    cmd.outputHelp();
    process.exit(1);
  }
  return dir;
}

export const createDefaultConfig: () => IApiConfig = () => ({
  ssr: true,
  env: {},
  rootDir: process.cwd(),
  outputPath: 'dist',
  platform: {
    name: 'web',
    framework: 'react',
    target: 'ssr'
  },
  publicDir: 'public',
  publicPath: PUBLIC_PATH,
  router: {
    history: 'auto'
  },
  apiConfig: {
    prefix: '/api',
    bodyParser: true
  }
});

export function loadConfig({
  rootDir = '.',
  configFile = CONFIG_FILE,
  overrides = {}
}: LoadConfigOptions = {}): IConfig {
  rootDir = path.resolve(rootDir);
  configFile = path.resolve(rootDir, configFile);

  // read dotenv so we can get env in shuvi.config.js
  loadDotenvConfig(rootDir);

  let fileConfig: IConfig = {};
  try {
    fileConfig = require(configFile);
    fileConfig = (fileConfig as any).default || fileConfig;
  } catch (err) {
    if (
      (err as Error).message.indexOf(`Cannot find module '${configFile}'`) < 0
    ) {
      throw err;
    } else if (configFile !== path.resolve(rootDir, CONFIG_FILE)) {
      console.warn('Config file not found: ' + configFile);
    }
  }
  return deepmerge({ rootDir }, fileConfig, overrides);
}

function set(obj: any, path: string, value: any) {
  const segments = path.split('.');
  const final = segments.pop()!;
  for (var i = 0; i < segments.length; i++) {
    if (!obj) {
      return;
    }
    obj = obj[segments[i]];
  }
  obj[final] = value;
}

/**
 * some options could be set to 'auto'
 * change them to specified value
 */
function modifyConfig(config: IApiConfig) {
  const {
    ssr,
    router: { history }
  } = config;
  // ensure apiRouteConfigPrefix starts with '/'
  const apiRouteConfigPrefix = config.apiConfig!.prefix;
  if (apiRouteConfigPrefix) {
    config.apiConfig!.prefix = path.resolve('/', apiRouteConfigPrefix);
  }
  // set history to a specific value
  if (history === 'auto') {
    config.router.history = ssr ? 'browser' : 'hash';
  }
}

export function getConfig(config: IConfig) {
  const finalConfig: IApiConfig = deepmerge(createDefaultConfig(), config);
  modifyConfig(finalConfig);
  return finalConfig;
}

export function getConfigByRootDir({
  rootDir = '.',
  configFile = CONFIG_FILE,
  overrides = {}
}: LoadConfigOptions = {}): IApiConfig {
  const result = loadConfig({
    rootDir,
    configFile,
    overrides
  });
  const finalConfig: IApiConfig = deepmerge(createDefaultConfig(), result);
  modifyConfig(finalConfig);
  return finalConfig;
}

export function getConfigFromCli(
  cliOptions: Record<string, any>,
  cliOptionsKeyMap: Record<
    string,
    string | ((config: any, optionValue: any) => void)
  > = {}
): IApiConfig {
  const config = {};
  Object.keys(cliOptionsKeyMap).forEach(key => {
    if (typeof cliOptions[key] !== 'undefined') {
      const mappedKeyOrFunction = cliOptionsKeyMap[key];
      const cliOptionValue = cliOptions[key];
      if (typeof mappedKeyOrFunction === 'function') {
        mappedKeyOrFunction(config, cliOptionValue);
      } else {
        set(config, mappedKeyOrFunction, cliOptionValue);
      }
    }
  });
  try {
    const { configOverrides } = cliOptions;
    if (configOverrides) {
      const overrides = JSON.stringify(configOverrides);
      Object.assign(config, overrides);
    }
  } catch (err) {
    console.error(err);
  }
  const rootDir = getProjectDir(cliOptions);
  const configFile =
    cliOptions.config && path.resolve(rootDir, cliOptions.config);
  const result = loadConfig({
    rootDir,
    configFile,
    overrides: config
  });
  const finalConfig: IApiConfig = deepmerge(createDefaultConfig(), result);
  modifyConfig(finalConfig);
  return finalConfig;
}
