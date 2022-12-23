import { readFile, pathExists, stat as fileStat } from 'fs-extra';
import os from 'os';
import path from 'path';
import chalk from '@shuvi/utils/chalk';
import logger from '@shuvi/utils/logger';
import { recursiveReadDir } from '@shuvi/utils/recursiveReaddir';
import { TsParsedConfig, TypeScriptModule } from './types';

export async function hasTypescriptFiles(projectDir: string): Promise<boolean> {
  try {
    const stats = await fileStat(projectDir);
    if (!stats.isDirectory()) {
      return false;
    }
  } catch (error) {
    return false;
  }

  const typescriptFiles = await recursiveReadDir(projectDir, {
    filter: /.*\.(ts|tsx)$/,
    ignore: /(\.shuvi)|(node_modules|.*\.d\.ts)/
  });

  return typescriptFiles.length > 0;
}

export async function hasTsConfig(tsConfigPath: string): Promise<boolean> {
  const hasTsConfig = await pathExists(tsConfigPath);

  if (hasTsConfig) {
    const tsConfig = await readFile(tsConfigPath, 'utf8').then(val =>
      val.trim()
    );
    const isEmpty = tsConfig === '' || tsConfig === '{}';
    return !isEmpty;
  }

  return false;
}

export async function getTsConfig(
  ts: TypeScriptModule,
  tsConfigPath: string
): Promise<TsParsedConfig> {
  const formatDiagnosticHost = {
    getCanonicalFileName: (fileName: string) => fileName,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => os.EOL
  };

  try {
    const { config: configToParse, error } = ts.readConfigFile(
      tsConfigPath,
      ts.sys.readFile
    );

    if (error) {
      throw new Error(ts.formatDiagnostic(error, formatDiagnosticHost));
    }

    // Get TS to parse and resolve any "extends"
    // Calling this function also mutates the tsconfig, adding in "include" and
    // "exclude", but the compilerOptions remain untouched
    const copiedConfig = JSON.parse(JSON.stringify(configToParse));
    const result = ts.parseJsonConfigFileContent(
      copiedConfig,
      ts.sys,
      path.dirname(tsConfigPath)
    );

    if (result.errors) {
      result.errors = result.errors.filter(
        ({ code }) =>
          // No inputs were found in config file
          code !== 18003
      );
    }

    if (result.errors?.length) {
      throw new Error(
        ts.formatDiagnostic(result.errors[0], formatDiagnosticHost)
      );
    }

    return result;
  } catch (err: any) {
    if (err && err.name === 'SyntaxError') {
      logger.error(
        'Could not parse',
        chalk.cyan('tsconfig.json') + '.',
        'Please make sure it contains syntactically correct JSON.'
      );
    }

    console.info(err?.message ? `${err.message}` : '');
    throw err;
  }
}
