import fs from 'fs';
import path from 'path';
import { bundleRequire } from '@modern-js/node-bundle-require';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import { findFirstExistedFile, withExts } from '@shuvi/utils/lib/file'
import { IConfig, IApiConfig } from '../api';
import { PUBLIC_PATH } from '../constants';
import { loadDotenvConfig } from './loadDotenvConfig';

export interface LoadConfigOptions {
  rootDir?: string;
  configFile?: string;
  overrides?: IConfig;
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

const DEFAUL_CONFIG_FILE_NAME = 'shuvi.config'
const validExts = ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs']

export const defineConfig = (config: IConfig) => config

export async function loadConfig({
  rootDir = '.',
  configFile = '',
  overrides = {}
}: LoadConfigOptions = {}): Promise<IConfig> {
  rootDir = path.resolve(rootDir);
  // read dotenv so we can get env in shuvi.config.js
  loadDotenvConfig(rootDir);

  let configFilePath: string
  if (configFile) {
    configFilePath = path.resolve(rootDir, configFile);
    if (!fs.existsSync(configFilePath)) {
      console.warn('Config file not found: ' + configFile);
      return deepmerge({ rootDir }, overrides)
    }
  } else {
    const defaultFiles = withExts(path.resolve(rootDir, DEFAUL_CONFIG_FILE_NAME), validExts)
    configFilePath = findFirstExistedFile(defaultFiles) as string
    if (!configFilePath) {
      return deepmerge({ rootDir }, overrides)
    }
  }

  let fileConfig: IConfig = {};
  try {
    fileConfig = await bundleRequire(configFilePath);
    fileConfig = (fileConfig as any).default || fileConfig;
  } catch (err) {
    throw err;
  }
  return deepmerge({ rootDir }, fileConfig, overrides);
}
