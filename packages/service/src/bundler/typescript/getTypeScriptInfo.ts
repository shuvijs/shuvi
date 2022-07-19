import { readFile, pathExists } from 'fs-extra';
import os from 'os';
import path from 'path';
import chalk from '@shuvi/utils/lib/chalk';
import { resolve } from '@shuvi/utils/lib/resolve';
import { recursiveReadDir } from '@shuvi/utils/lib/recursiveReaddir';
import { TsConfig, TypeScriptModule } from './types';

export interface PackageDep {
  file: string;
  pkg: string;
}

export type CheckedDependenciesResult = {
  resovled: Map<string, string>; // <pkg, resolvePath>
  missing: PackageDep[];
};

const requiredPackages = [
  { file: 'typescript', pkg: 'typescript' },
  { file: '@types/react/index.d.ts', pkg: '@types/react' },
  { file: '@types/node/index.d.ts', pkg: '@types/node' }
];

function checkDependencies(
  dir: string,
  deps: PackageDep[]
): CheckedDependenciesResult {
  let resolutions = new Map<string, string>();

  const missingPackages = deps.filter(p => {
    try {
      resolutions.set(p.pkg, resolve(p.file, { basedir: `${dir}/` }));
      return false;
    } catch (_) {
      return true;
    }
  });

  return {
    resovled: resolutions,
    missing: missingPackages
  };
}

export async function hasTypescriptFiles(projectDir: string): Promise<boolean> {
  const typescriptFiles = await recursiveReadDir(projectDir, {
    filter: /.*\.(ts|tsx)$/,
    ignore: /(\.shuvi)|(node_modules|.*\.d\.ts)/
  });

  return typescriptFiles.length > 0;
}

export function checkNecessarytDeps(
  projectDir: string
): CheckedDependenciesResult {
  return checkDependencies(projectDir, requiredPackages);
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
): Promise<TsConfig> {
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
      console.error(
        chalk.red.bold(
          'Could not parse',
          chalk.cyan('tsconfig.json') + '.',
          'Please make sure it contains syntactically correct JSON.'
        )
      );
    }

    console.info(err?.message ? `${err.message}` : '');
    throw err;
  }
}
