import { IApiConfig } from '@shuvi/types';
import path from 'path';
import { PUBLIC_PATH } from '../constants';
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
  userConfig: IConfig = {}
): Promise<IConfig> {
  userConfig.rootDir = userConfig.rootDir
    ? path.resolve(userConfig.rootDir)
    : process.cwd();

  // read dotenv so we can get env in shuvi.config.js
  loadDotenvConfig(userConfig.rootDir);

  if (configFile) {
    const config = await loadConfigFromFile<IConfig>(configFile);
    return deepmerge(config, userConfig);
  }

  return userConfig;
}
