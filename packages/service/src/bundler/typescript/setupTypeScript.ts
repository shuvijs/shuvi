import * as path from 'path';
import chalk from '@shuvi/utils/lib/chalk';
import fs from 'fs-extra';
import { Error } from '../../error';
import { IPaths } from '../../core/apiTypes';
import { getPkgManager } from '../helper/getPkgManager';
import { TypeScriptModule, TsCompilerOptions } from './types';
import { writeDefaultConfigurations } from './configTypeScript';
import {
  hasTsConfig,
  hasTypescriptFiles,
  checkNecessaryDeps,
  getTsConfig,
  PackageDep
} from './getTypeScriptInfo';
import { installDependencies } from './installDependencies';

let hasSetup = false;

export interface TypeScriptInfo {
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
let typescriptModule: TypeScriptModule;
let jsConfigPath: string | undefined;
let hasJsconfig: boolean;
let resolvedBaseUrl: string | undefined;

function missingPackagesError(dir: string, pkgs: PackageDep[]) {
  const packageManager = getPkgManager(dir);
  const packagesHuman = pkgs
    .map(
      (p, index, { length }) =>
        (index > 0
          ? index === length - 1
            ? length > 2
              ? ', and '
              : ' and '
            : ', '
          : '') + p.pkg
    )
    .join('');
  const packagesCli = pkgs.map(p => p.pkg).join(' ');

  const removalMsg =
    '\n\n' +
    chalk.bold(
      'If you are not trying to use TypeScript, please remove the ' +
        chalk.cyan('tsconfig.json') +
        ' file from your package root (and any TypeScript files in your routes directory).'
    );

  throw Error.Fatal(
    chalk.bold.red(
      `It looks like you're trying to use TypeScript but do not have the required package(s) installed.`
    ) +
      '\n\n' +
      chalk.bold(`Please install ${chalk.bold(packagesHuman)} by running:`) +
      '\n\n' +
      `\t${chalk.bold.cyan(
        (packageManager === 'yarn'
          ? 'yarn add --dev'
          : packageManager === 'pnpm'
          ? 'pnpm install --save-dev'
          : 'npm install --save-dev') +
          ' ' +
          packagesCli
      )}` +
      removalMsg +
      '\n'
  );
}

export function getTypeScriptInfo(): TypeScriptInfo {
  if (!hasSetup) {
    throw Error.Fatal(
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

export async function loadUpdatedTsConfig(projectDir: string) {
  if (!hasSetup) {
    throw Error.Fatal(
      "please call 'setupTypeScript' before calling 'loadUpdatedTsConfig'"
    );
  }

  if (useTypeScript && tsConfigPath) {
    const tsConfig = await getTsConfig(typescriptModule, tsConfigPath);
    tsCompilerOptions = tsConfig.options;
  }

  if (!useTypeScript && hasJsconfig && jsConfigPath) {
    const userJsConfig = await fs.readJSON(jsConfigPath);
    tsCompilerOptions = userJsConfig.compilerOptions;
  }

  if (tsCompilerOptions?.baseUrl) {
    resolvedBaseUrl = path.resolve(projectDir, tsCompilerOptions.baseUrl);
  }
}

export async function setupTypeScript(
  paths: IPaths,
  reportMissingError: boolean = false,
  enabledTypeScript?: boolean
) {
  hasSetup = true;
  const projectDir = paths.rootDir;
  useTypeScript = enabledTypeScript || (await hasTypescriptFiles(paths.srcDir));
  tsCompilerOptions = {};
  if (useTypeScript) {
    let deps = checkNecessaryDeps(projectDir);
    if (deps.missing.length > 0) {
      if (reportMissingError) {
        missingPackagesError(projectDir, deps.missing);
      }
      console.log(
        chalk.bold.yellow(
          `It looks like you're trying to use TypeScript but do not have the required package(s) installed.`
        ) +
          '\n' +
          'Installing dependencies' +
          '\n\n' +
          chalk.bold(
            'If you are not trying to use TypeScript, please remove the ' +
              chalk.cyan('tsconfig.json') +
              ' file from your package root (and any TypeScript files in your pages directory).'
          ) +
          '\n'
      );

      await installDependencies(paths.srcDir, deps.missing, true).catch(err => {
        if (err && typeof err === 'object' && 'command' in err) {
          console.error(
            `Failed to install required TypeScript dependencies, please install them manually to continue:\n` +
              (err as any).command +
              '\n'
          );
        }
        throw err;
      });

      deps = checkNecessaryDeps(projectDir);
    }

    typeScriptPath = deps.resovled.get('typescript');
    tsConfigPath = path.join(projectDir, 'tsconfig.json');
    const needDefaultTsConfig = !(await hasTsConfig(tsConfigPath));
    if (needDefaultTsConfig) {
      console.log(
        chalk.cyan(
          `We detected TypeScript in your project and created a ${chalk.bold(
            'tsconfig.json'
          )} file for you.`
        )
      );
      console.log();
      await fs.writeJson(tsConfigPath, {});
    }
    typescriptModule = require(typeScriptPath!) as TypeScriptModule;
    const tsConfig = await getTsConfig(typescriptModule, tsConfigPath);
    tsCompilerOptions = tsConfig.options;
    await writeDefaultConfigurations(
      typescriptModule,
      tsConfigPath,
      tsConfig,
      paths,
      needDefaultTsConfig
    );
  }

  jsConfigPath = path.join(projectDir, 'jsconfig.json');
  hasJsconfig = await fs.pathExists(jsConfigPath);
  if (!useTypeScript && hasJsconfig) {
    const userJsConfig = await fs.readJSON(jsConfigPath);
    tsCompilerOptions = userJsConfig.compilerOptions;
  }

  if (tsCompilerOptions?.baseUrl) {
    resolvedBaseUrl = path.resolve(projectDir, tsCompilerOptions.baseUrl);
  }
}
