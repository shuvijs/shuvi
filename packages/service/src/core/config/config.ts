import * as fs from 'fs';
import * as path from 'path';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import {
  bundleRequire,
  PATH_SEG_RE,
  JS_EXT_RE
} from '@shuvi/toolpack/lib/utils/bundle-require';
import { findFirstExistedFile, withExts } from '@shuvi/utils/lib/file';
import { InternalConfig, Config, NormalizedConfig } from '../apiTypes';
import { DEFAULT_PUBLIC_PATH } from '../../constants';
import { loadDotenvConfig } from './loadDotenvConfig';

export interface LoadConfigOptions {
  rootDir?: string;
  filepath?: string;
  loadEnv?: boolean;
}

export interface ResolveConfigOptions {
  config?: Config;
  overrides?: Config[];
}

const DEFAUL_CONFIG_FILE_NAME = 'shuvi.config';
const validExts = ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs'];

export const createDefaultConfig: () => InternalConfig = () => ({
  env: {},
  rootDir: process.cwd(),
  analyze: false,
  outputPath: 'dist',
  platform: {
    name: 'web',
    framework: 'react',
    target: 'ssr'
  },
  publicDir: 'public',
  publicPath: DEFAULT_PUBLIC_PATH,
  typescript: {
    ignoreBuildErrors: false
  },
  experimental: {
    parcelCss: false,
    preBundle: false
  }
});

export const defineConfig = (config: Config) => config;

export function mergeConfig(...configs: any[]): any {
  return deepmerge(...configs);
}

export async function loadConfig({
  rootDir = '.',
  filepath = '',
  loadEnv = true
}: LoadConfigOptions = {}): Promise<Config> {
  rootDir = path.resolve(rootDir);

  // read dotenv so we can get env in shuvi.config.js
  if (loadEnv) {
    loadDotenvConfig(rootDir);
  }

  let configFilePath: string;
  if (filepath) {
    configFilePath = path.resolve(rootDir, filepath);
    if (!fs.existsSync(configFilePath)) {
      console.warn('Config file not found: ' + filepath);
      return {};
    }
  } else {
    const defaultFiles = withExts(
      path.resolve(rootDir, DEFAUL_CONFIG_FILE_NAME),
      validExts
    );
    configFilePath = findFirstExistedFile(defaultFiles) as string;
    if (!configFilePath) {
      return {};
    }
  }
  let fileConfig: Config = {};

  const getOutputFile = (filepath: string) =>
    path.join(
      rootDir,
      '.shuvi',
      'temp',
      filepath
        .replace(PATH_SEG_RE, '_')
        .replace(JS_EXT_RE, `.bundled_${Date.now()}.cjs`)
    );
  fileConfig = await bundleRequire(configFilePath, { getOutputFile });
  fileConfig = (fileConfig as any).default || fileConfig;

  return fileConfig;
}

/** resolve a full `Config` to be a `NormalizedConfig` */
export function resolveConfig(
  config: Config,
  overrides: Config[] = []
): NormalizedConfig {
  const configs = [createDefaultConfig(), config].concat(overrides || []);
  const resolvedConfig: NormalizedConfig = mergeConfig.apply(null, configs);
  return resolvedConfig;
}
