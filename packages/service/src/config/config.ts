import path from 'path';
import fs from 'fs';
import {
  bundleRequire,
  PATH_SEG_RE,
  JS_EXT_RE
} from '@shuvi/toolpack/lib/utils/bundleRequire';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import { findFirstExistedFile, withExts } from '@shuvi/utils/lib/file';
import logger from '@shuvi/utils/lib/logger';
import { ShuviConfig } from './configTypes';
import { loadDotenvConfig } from './env';

const DEFAUL_CONFIG_FILE_NAME = 'shuvi.config';
const validExts = ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs'];

export interface LoadConfigOptions {
  rootDir?: string;
  filepath?: string;
  loadEnv?: boolean;
}

function getDefaultPlatformConfig() {
  return {
    ssr: true,
    router: {
      history: 'auto'
    },
    conventionRoutes: {}
  };
}

export function normalizeConfig(rawConfig: ShuviConfig): ShuviConfig {
  const config = deepmerge(getDefaultPlatformConfig(), rawConfig);
  if (config.router.history === 'auto') {
    config.router.history = config.ssr ? 'browser' : 'hash';
  }

  return config;
}

export async function loadConfig({
  rootDir = '.',
  filepath = '',
  loadEnv = true
}: LoadConfigOptions = {}): Promise<ShuviConfig> {
  rootDir = path.resolve(rootDir);

  // read dotenv so we can get env in shuvi.config.js
  if (loadEnv) {
    loadDotenvConfig(rootDir);
  }

  let configFilePath: string;
  if (filepath) {
    configFilePath = path.resolve(rootDir, filepath);
    if (!fs.existsSync(configFilePath)) {
      logger.warn('Config file not found: ' + filepath);
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
  let fileConfig: ShuviConfig = {};

  const getOutputFile = (filepath: string) =>
    path.join(
      rootDir,
      '.shuvi',
      'cache',
      'bundle-require',
      filepath
        .replace(PATH_SEG_RE, '_')
        .replace(JS_EXT_RE, `.bundled_${Date.now()}.cjs`)
    );
  fileConfig = await bundleRequire(configFilePath, { getOutputFile });
  fileConfig = (fileConfig as any).default || fileConfig;

  return fileConfig;
}

export function defineConfig(config: ShuviConfig): ShuviConfig {
  return config;
}
