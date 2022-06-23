import * as path from 'path';
import chalk from '@shuvi/utils/lib/chalk';
import fs from 'fs-extra';
import { IPaths } from '../../core/apiTypes';
import { TypeScriptModule, TsCompilerOptions } from './types';
import { writeDefaultConfigurations } from './configTypeScript';
import {
  hasTsConfig,
  hasTypescriptFiles,
  getTypeScriptPath,
  getTsConfig
} from './getTypeScriptInfo';

let hasSetup = false;

interface TypeScriptInfo {
  useTypeScript: boolean;
  typeScriptPath?: string;
  tsConfigPath?: string;
  tsCompilerOptions: TsCompilerOptions;
  resolvedBaseUrl?: string;
}

let useTypeScript: boolean;
let typeScriptPath: string | undefined;
let tsConfigPath: string | undefined;
let tsCompilerOptions: TsCompilerOptions;
let resolvedBaseUrl: string | undefined;

export function getTypeScriptInfo(): TypeScriptInfo {
  if (!hasSetup) {
    var stack = new Error().stack;
    console.log('getTypeScriptInfo', stack);
    throw new Error(
      "please call 'setupTypeScript' before calling 'getTypeScriptInfo'"
    );
  }

  return {
    useTypeScript,
    typeScriptPath,
    tsConfigPath,
    tsCompilerOptions,
    resolvedBaseUrl
  };
}

export async function setupTypeScript(paths: IPaths) {
  if (hasSetup) {
    return;
  }

  hasSetup = true;
  const projectDir = paths.rootDir;
  useTypeScript = await hasTypescriptFiles(projectDir);
  tsCompilerOptions = {};
  if (useTypeScript) {
    typeScriptPath = getTypeScriptPath(projectDir);
    if (!typeScriptPath) {
      process.exit(-1);
    }

    tsConfigPath = path.join(projectDir, 'tsconfig.json');
    const needDefaultTsConfig = !(await hasTsConfig(tsConfigPath));

    if (needDefaultTsConfig) {
      console.log(
        chalk.yellow(
          `We detected TypeScript in your project and created a ${chalk.bold(
            'tsconfig.json'
          )} file for you.`
        )
      );
      console.log();
      await fs.writeJson(tsConfigPath, {});
    }

    const ts = (await import(typeScriptPath!)) as TypeScriptModule;
    const tsConfig = await getTsConfig(ts, tsConfigPath);
    tsCompilerOptions = tsConfig.options;
    await writeDefaultConfigurations(ts, tsConfigPath, tsConfig, paths);
  }

  const jsConfigPath = path.join(projectDir, 'jsconfig.json');
  if (!useTypeScript && (await fs.pathExists(jsConfigPath))) {
    const userJsConfig = await fs.readJSON(jsConfigPath);
    tsCompilerOptions = userJsConfig.compilerOptions;
  }

  if (tsCompilerOptions?.baseUrl) {
    resolvedBaseUrl = path.resolve(projectDir, tsCompilerOptions.baseUrl);
  }
}
