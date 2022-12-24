import path from 'path';
import fs from 'fs';
import {
  bundleRequire,
  PATH_SEG_RE,
  JS_EXT_RE
} from '@shuvi/toolpack/lib/utils/bundleRequire';
import { findFirstExistedFile, withExts } from '@shuvi/utils/file';
import logger from '@shuvi/utils/logger';
import { ShuviConfig } from '../core';
import { CONFIG_FILE } from '../constants';
import { loadDotenvConfig } from './env';

const validExts = ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs'];

export interface LoadConfigOptions {
  rootDir?: string;
  filepath?: string;
  forceReloadEnv?: boolean;
}

export async function loadConfig({
  rootDir = '.',
  filepath = '',
  forceReloadEnv = false
}: LoadConfigOptions = {}): Promise<ShuviConfig> {
  rootDir = path.resolve(rootDir);

  // read dotenv so we can get env in shuvi.config.js
  loadDotenvConfig({ rootDir, forceReloadEnv });

  let configFilePath: string;
  if (filepath) {
    configFilePath = path.resolve(rootDir, filepath);
    if (!fs.existsSync(configFilePath)) {
      logger.warn('Config file not found: ' + filepath);
      return {};
    }
  } else {
    const defaultFiles = withExts(
      path.resolve(rootDir, CONFIG_FILE),
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
