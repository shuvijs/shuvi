import { IApiConfig } from '@shuvi/types';
import path from 'path';
import { CONFIG_FILE, PUBLIC_PATH } from '../constants';
import { loadDotenvConfig } from './loadDotenvConfig';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';

export type IConfig = Partial<IApiConfig>;

export const defaultConfig: IApiConfig = {
  ssr: true,
  env: {},
  rootDir: process.cwd(),
  outputPath: 'dist',
  publicDir: 'public',
  publicPath: PUBLIC_PATH,
  router: {
    history: 'auto'
  }
};

async function loadConfigFromFile<T>(configPath: string): Promise<T> {
  const absolutePath = path.isAbsolute(configPath)
    ? configPath
    : path.resolve(configPath);
  let config = {} as T;

  try {
    config = require(absolutePath);
    config = (config as any).default || config;
  } catch (err) {
    // Ignore MODULE_NOT_FOUND
    if (err.code !== 'MODULE_NOT_FOUND') {
      throw err;
    }
  }

  return config;
}

export async function loadConfig(
  configFile?: string,
  userConfig?: IConfig
): Promise<IConfig> {
  let rootDir = process.cwd();

  if (configFile) {
    rootDir = path.join(configFile, '..');
  } else if (userConfig?.rootDir) {
    rootDir = userConfig.rootDir;
  }

  // read dotenv so we can get env in shuvi.config.js
  loadDotenvConfig(rootDir);

  if (configFile && configFile.endsWith(CONFIG_FILE)) {
    const config = await loadConfigFromFile<IConfig>(configFile);

    if (!config.rootDir) {
      config.rootDir = rootDir;
    }

    return deepmerge(config, userConfig || {});
  } else if (userConfig) {
    return userConfig;
  } else {
    throw new Error(
      `configFile expect to end with '${CONFIG_FILE}', but recevied ${configFile}`
    );
  }
}
