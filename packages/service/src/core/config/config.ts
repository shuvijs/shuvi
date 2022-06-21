import * as fs from 'fs';
import * as path from 'path';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import {
  bundleRequire,
  PATH_SEG_RE,
  JS_EXT_RE
} from '@shuvi/toolpack/lib/utils/bundle-require';
import { findFirstExistedFile, withExts } from '@shuvi/utils/lib/file';
import { Config, UserConfig } from '../apiTypes';
import { PUBLIC_PATH } from '../../constants';
import { loadDotenvConfig } from './loadDotenvConfig';

export interface LoadConfigOptions {
  rootDir?: string;
  filepath?: string;
  loadEnv?: boolean;
}

export interface ResolveConfigOptions {
  config?: UserConfig;
  overrides?: UserConfig[];
}

const DEFAUL_CONFIG_FILE_NAME = 'shuvi.config';
const validExts = ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs'];

export const createDefaultConfig: () => UserConfig = () => ({
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
  },
  experimental: {
    parcelCss: false,
    loader: {
      sequential: true
    }
  },
  typescript: {
    ignoreBuildErrors: false
  }
});

export const defineConfig = (config: UserConfig) => config;

export function mergeConfig(...configs: any[]): any {
  return deepmerge(...configs);
}

export async function loadConfig({
  rootDir = '.',
  filepath = '',
  loadEnv = true
}: LoadConfigOptions = {}): Promise<UserConfig> {
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
  let fileConfig: UserConfig = {};

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

/** resolve a full `UserConfig` to be a `Config` */
export function resolveConfig(
  config: UserConfig,
  overrides: UserConfig[] = []
): Config {
  const configs = [{}, config].concat(overrides || []);
  const resolvedConfig: Config = mergeConfig.apply(null, configs);
  const apiRouteConfigPrefix = resolvedConfig.apiConfig.prefix;
  if (apiRouteConfigPrefix) {
    resolvedConfig.apiConfig.prefix = path.resolve('/', apiRouteConfigPrefix);
  }
  if (resolvedConfig.router.history === 'auto') {
    resolvedConfig.router.history = resolvedConfig.ssr ? 'browser' : 'hash';
  }
  return resolvedConfig;
}

/** patch a userConfig to be a full `UserConfig` */
export function getFullUserConfig(
  config: UserConfig = {}
): Required<UserConfig> {
  return mergeConfig(createDefaultConfig(), config);
}
