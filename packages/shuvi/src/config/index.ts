import { IApiConfig } from '@shuvi/types';
import path from 'path';
import { CONFIG_FILE, PUBLIC_PATH } from '../constants';

export type IConfig = Partial<IApiConfig>;

export const defaultConfig: IApiConfig = {
  ssr: true,
  env: {},
  rootDir: process.cwd(),
  outputPath: 'dist',
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
  dir: string = process.cwd()
): Promise<IConfig> {
  const config = await loadConfigFromFile<IConfig>(path.join(dir, CONFIG_FILE));

  if (!config.rootDir) {
    config.rootDir = dir;
  }

  return config;
}
