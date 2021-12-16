import path from 'path';
import { CONFIG_FILE } from '@shuvi/shared/lib/constants';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import { loadDotenvConfig } from './loadDotenvConfig';
import { UserConfig, NormalizedUserConfig } from './types';

export interface LoadConfigOptions {
  dir?: string;
  configFile?: string;
  overrides?: UserConfig;
}

export function loadConfig({
  dir = '.',
  configFile = CONFIG_FILE,
  overrides = {}
}: LoadConfigOptions = {}): NormalizedUserConfig {
  const rootDir = path.resolve(dir);
  configFile = path.resolve(dir, configFile);

  // read dotenv so we can get env in shuvi.config.js
  loadDotenvConfig(rootDir);

  let fileConfig: UserConfig = {};
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

  return deepmerge(fileConfig, overrides);
}
