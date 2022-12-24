import * as path from 'path';
import chalk from '@shuvi/utils/chalk';
import fs from 'fs-extra';
import { Error } from '../../error';
import { IPaths } from '../../core/apiTypes';
import { getPkgManager } from '../helper/getPkgManager';
import { TypeScriptModule, TsCompilerOptions, TsParsedConfig } from './types';
import { writeDefaultConfigurations } from './configTypeScript';
import { hasTsConfig, hasTypescriptFiles, getTsConfig } from './getTsConfig';
import {
  resolveDependencies,
  checkNecessaryDeps,
  PackageDep
} from './checkDependencies';
import { installDependencies } from './installDependencies';

let hasSetup = false;

export interface JavaScriptInfo {
  useTypeScript: boolean;
  typeScriptPath?: string;
  compilerOptions: TsCompilerOptions;
  resolvedBaseUrl: string;
}

export interface ParsedJsConfig {
  useTypescript: boolean;
  tsParsedConfig?: TsParsedConfig;
  compilerOptions: TsCompilerOptions;
  resolvedBaseUrl: string;
}

let useTypeScript: boolean;
let compilerOptions: TsCompilerOptions;
let typeScriptPath: string | undefined;
let typescriptModule: TypeScriptModule | undefined;
let resolvedBaseUrl: string;

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

export function getJavaScriptInfo(): JavaScriptInfo {
  if (!hasSetup) {
    throw Error.Fatal(
      "please call 'setupTypeScript' before calling 'getJavaScriptInfo'"
    );
  }

  return {
    useTypeScript,
    typeScriptPath,
    compilerOptions,
    resolvedBaseUrl
  };
}

export async function loadJsConfig(
  projectDir: string,
  {
    typeScriptPath,
    typescript = false
  }: {
    typeScriptPath?: string;
    typescript?: boolean;
  }
): Promise<ParsedJsConfig> {
  let useTypescript: boolean = typescript;
  let tsParsedConfig: TsParsedConfig | undefined;
  let compilerOptions: TsCompilerOptions = {};
  let resolvedBaseUrl: string | undefined;
  if (useTypeScript) {
    const tsConfigPath = path.join(projectDir, 'tsconfig.json');
    if (!typeScriptPath) {
      const deps = resolveDependencies(projectDir, [
        { file: 'typescript', pkg: 'typescript' }
      ]);
      typeScriptPath = deps.resovled.get('typescript');
    }
    if (typeScriptPath && (await hasTsConfig(tsConfigPath))) {
      const typescriptModule = require(typeScriptPath!) as TypeScriptModule;
      tsParsedConfig = await getTsConfig(typescriptModule, tsConfigPath);
      compilerOptions = tsParsedConfig.options;
    }
  } else {
    const jsConfigPath = path.join(projectDir, 'jsconfig.json');
    if (await fs.pathExists(jsConfigPath)) {
      const jsConfig = await fs.readJSON(jsConfigPath);
      compilerOptions = jsConfig.compilerOptions;
    }
  }

  if (compilerOptions?.baseUrl) {
    resolvedBaseUrl = path.resolve(projectDir, compilerOptions.baseUrl);
  } else {
    resolvedBaseUrl = projectDir;
  }

  return { useTypescript, tsParsedConfig, compilerOptions, resolvedBaseUrl };
}

export async function setupTypeScript(
  paths: IPaths,
  {
    reportMissingError = false,
    enableTypeScript
  }: {
    reportMissingError: boolean;
    enableTypeScript?: boolean;
  }
) {
  hasSetup = true;
  useTypeScript = enableTypeScript || (await hasTypescriptFiles(paths.srcDir));
  const projectDir = paths.rootDir;
  let parsedJsConfig: ParsedJsConfig;
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
    const tsConfigPath = path.join(projectDir, 'tsconfig.json');
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
    parsedJsConfig = await loadJsConfig(projectDir, {
      typescript: true
    });
    await writeDefaultConfigurations(
      typescriptModule,
      tsConfigPath,
      parsedJsConfig.tsParsedConfig!,
      paths,
      needDefaultTsConfig
    );
  } else {
    parsedJsConfig = await loadJsConfig(projectDir, { typescript: false });
  }

  compilerOptions = parsedJsConfig.compilerOptions;
  resolvedBaseUrl = parsedJsConfig.resolvedBaseUrl;
}
