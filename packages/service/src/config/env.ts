// ref: https://github.com/vercel/next.js/blob/canary/packages/next-env/index.ts

import * as dotenv from 'dotenv';
import { expand as dotenvExpand } from 'dotenv-expand';
import * as fs from 'fs';
import * as path from 'path';
import logger from '@shuvi/utils/lib/logger';

export type Env = { [key: string]: string | undefined };
export type LoadedEnvFiles = Array<{
  path: string;
  contents: string;
}>;

let initialEnv: Env | undefined = undefined;
let combinedEnv: Env | undefined = undefined;
let cachedLoadedEnvFiles: LoadedEnvFiles = [];
let previousLoadedEnvFiles: LoadedEnvFiles = [];

export function processEnv(
  loadedEnvFiles: LoadedEnvFiles,
  dir?: string,
  forceReload = false
) {
  if (!initialEnv) {
    initialEnv = Object.assign({}, process.env);
  }

  if (
    !forceReload &&
    (process.env.__SHUVI_PROCESSED_ENV || loadedEnvFiles.length === 0)
  ) {
    return process.env as Env;
  }
  // flag that we processed the environment values in case a serverless function is re-used
  process.env.__SHUVI_PROCESSED_ENV = 'true';

  const origEnv = Object.assign({}, initialEnv);
  const parsed: dotenv.DotenvParseOutput = {};

  for (const envFile of loadedEnvFiles) {
    try {
      let result: dotenv.DotenvConfigOutput = {};
      result.parsed = dotenv.parse(envFile.contents);

      result = dotenvExpand(result);

      if (
        result.parsed &&
        !previousLoadedEnvFiles.some(
          item =>
            item.contents === envFile.contents && item.path === envFile.path
        )
      ) {
        logger.info(`Loaded env from ${path.join(dir || '', envFile.path)}`);
      }

      for (const key of Object.keys(result.parsed || {})) {
        if (
          typeof parsed[key] === 'undefined' &&
          typeof origEnv[key] === 'undefined'
        ) {
          parsed[key] = result.parsed?.[key]!;
        }
      }
    } catch (err) {
      logger.error(
        `Failed to load env from ${path.join(dir || '', envFile.path)}`,
        err
      );
    }
  }
  return Object.assign(process.env, parsed);
}

export const loadDotenvConfig = (dir: string, forceReload = false) => {
  if (!initialEnv) {
    initialEnv = Object.assign({}, process.env);
  }

  if (combinedEnv && !forceReload) {
    return { combinedEnv, loadedEnvFiles: cachedLoadedEnvFiles };
  }
  // @ts-ignore
  process.env = Object.assign({}, initialEnv);

  previousLoadedEnvFiles = cachedLoadedEnvFiles;
  cachedLoadedEnvFiles = [];

  const mode = process.env.NODE_ENV!;

  // Priority top to bottom
  const dotenvFiles = [
    `.env.${mode}.local`,
    `.env.local`,
    `.env.${mode}`,
    '.env'
  ];

  for (const envFile of dotenvFiles) {
    const dotEnvPath = path.join(dir, envFile);

    try {
      const stats = fs.statSync(dotEnvPath);

      if (!stats.isFile()) {
        continue;
      }

      const contents = fs.readFileSync(dotEnvPath, 'utf8');
      cachedLoadedEnvFiles.push({
        path: envFile,
        contents
      });
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        throw new Error(`Failed to load env from ${envFile}\n${err}`);
      }
    }
  }

  combinedEnv = processEnv(cachedLoadedEnvFiles, dir, forceReload);
  return { combinedEnv, loadedEnvFiles: cachedLoadedEnvFiles };
};
