import { IApiConfig } from '@shuvi/types';
import path from 'path';
import { PUBLIC_PATH, CONFIG_FILE } from '../constants';
import { loadDotenvConfig } from './loadDotenvConfig';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';

export type IConfig = Partial<IApiConfig>;

export interface LoadConfigOptions {
  rootDir?: string;
  configFile?: string;
  overrides?: IConfig;
}

export const defaultConfig: IApiConfig = {
  ssr: true,
  env: {},
  rootDir: process.cwd(),
  outputPath: 'dist',
  publicDir: 'public',
  publicPath: PUBLIC_PATH,
  router: {
    history: 'auto'
  },
  resolve: {},
};

export async function loadConfig({
  rootDir = '.',
  configFile = CONFIG_FILE,
  overrides = {}
}: LoadConfigOptions = {}): Promise<IConfig> {
  rootDir = path.resolve(rootDir);
  configFile = path.resolve(rootDir, configFile);

  // read dotenv so we can get env in shuvi.config.js
  loadDotenvConfig(rootDir);

  let fileConfig: IConfig = {};
  try {
    fileConfig = require(configFile);
    fileConfig = (fileConfig as any).default || fileConfig;
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      throw err;
    } else if (configFile !== path.resolve(rootDir, CONFIG_FILE)) {
      console.warn('Config file not found: ' + configFile);
    }
  }
  return deepmerge({ rootDir }, fileConfig, overrides);
}
