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

  if (userConfig?.rootDir) {
    rootDir = path.isAbsolute(userConfig.rootDir)
      ? userConfig.rootDir
      : path.resolve(userConfig.rootDir);
  }

  // read dotenv so we can get env in shuvi.config.js
  loadDotenvConfig(rootDir);

  if (configFile) {
    if (configFile.endsWith(CONFIG_FILE)) {
      const config = await loadConfigFromFile<IConfig>(configFile);

      if (!config.rootDir) {
        config.rootDir = rootDir;
      }

      return deepmerge(config, userConfig || {});
    } else {
      throw new Error(
        `configFile expect to end with '${CONFIG_FILE}', but recevied '${configFile}'`
      );
    }
  } else if (userConfig) {
    if (!userConfig.rootDir) {
      userConfig.rootDir = rootDir;
    }

    return userConfig;
  } else {
    throw new Error(`Expected either configFile or config to be defined.`);
  }
}
