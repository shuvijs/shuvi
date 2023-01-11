import chalk from '@shuvi/utils/chalk';
import isEqual from '@shuvi/utils/isEqual';
import fs from 'fs-extra';
import * as CommentJson from 'comment-json';
import os from 'os';
import path from 'path';
import { IPaths } from '../../core/apiTypes';
import { TypeScriptModule, TsParsedConfig } from './types';

export async function writeDefaultConfigurations(
  ts: TypeScriptModule,
  tsConfigPath: string,
  tsConfig: TsParsedConfig,
  paths: IPaths,
  isFirstTimeSetup: boolean
) {
  const compilerOptions: any = {
    // These are suggested values and will be set when not present in the
    // tsconfig.json
    // 'parsedValue' matches the output value from ts.parseJsonConfigFileContent()
    target: {
      parsedValue: ts.ScriptTarget.ES5,
      suggested: 'es5'
    },
    lib: { suggested: ['dom', 'dom.iterable', 'esnext'] },
    allowJs: { suggested: true },
    skipLibCheck: { suggested: true },
    strict: { suggested: false },
    forceConsistentCasingInFileNames: { suggested: true },
    noEmit: { suggested: true },
    strictNullChecks: { suggested: true },
    // These values are required and cannot be changed by the user
    // Keep this in sync with the webpack config
    esModuleInterop: {
      value: true,
      reason: 'requirement for SWC / babel'
    },
    noImplicitThis: {
      value: true,
      reason: 'requirement for doura'
    },
    module: {
      parsedValue: ts.ModuleKind.ESNext,
      // All of these values work:
      parsedValues: [
        ts.ModuleKind.Node16,
        ts.ModuleKind.ES2020,
        ts.ModuleKind.ESNext,
        ts.ModuleKind.CommonJS,
        ts.ModuleKind.AMD
      ],
      value: 'esnext',
      reason: 'for dynamic import() support'
    },
    moduleResolution: {
      parsedValue: ts.ModuleResolutionKind.Node16,
      // All of these values work:
      parsedValues: [
        ts.ModuleResolutionKind.NodeJs,
        ts.ModuleResolutionKind.Node16,
        ts.ModuleResolutionKind.NodeNext
      ],
      value: 'node16',
      reason: 'to match webpack resolution'
    },
    resolveJsonModule: { value: true, reason: 'to match webpack resolution' },
    isolatedModules: {
      value: true,
      reason: 'requirement for SWC / Babel'
    },
    jsx: { parsedValue: ts.JsxEmit.Preserve, value: 'preserve' }
  };

  const userTsConfigContent = await fs.readFile(tsConfigPath, {
    encoding: 'utf8'
  });
  const userTsConfig = CommentJson.parse(userTsConfigContent) as Record<
    string,
    any
  >;
  const { options: tsOptions, raw: rawConfig } = tsConfig;
  if (userTsConfig.compilerOptions == null && !('extends' in rawConfig)) {
    userTsConfig.compilerOptions = {};
  }

  const suggestedActions: string[] = [];
  const requiredActions: string[] = [];
  for (const optionKey of Object.keys(compilerOptions)) {
    const check = compilerOptions[optionKey];
    if ('suggested' in check) {
      if (!(optionKey in tsOptions)) {
        if (!userTsConfig.compilerOptions) {
          userTsConfig.compilerOptions = {};
        }
        userTsConfig.compilerOptions[optionKey] = check.suggested;
        suggestedActions.push(
          chalk.cyan(optionKey) + ' was set to ' + chalk.bold(check.suggested)
        );
      }
    } else if ('value' in check) {
      const ev = tsOptions[optionKey];
      if (
        !('parsedValues' in check
          ? check.parsedValues?.includes(ev)
          : 'parsedValue' in check
          ? check.parsedValue === ev
          : check.value === ev)
      ) {
        if (!userTsConfig.compilerOptions) {
          userTsConfig.compilerOptions = {};
        }
        userTsConfig.compilerOptions[optionKey] = check.value;
        requiredActions.push(
          chalk.cyan(optionKey) +
            ' was set to ' +
            chalk.bold(check.value) +
            ` (${check.reason})`
        );
      }
    } else {
      // never
    }
  }

  if (tsOptions.baseUrl == null) {
    userTsConfig.compilerOptions.baseUrl = './';
  }

  // resolve @shuvi/runtime to the real file
  const pathAlias = userTsConfig.compilerOptions.paths;
  const shuviPaths: Record<string, string[]> = {
    '@shuvi/runtime': [
      path.relative(
        path.resolve(
          paths.rootDir,
          userTsConfig.compilerOptions.baseUrl || tsOptions.baseUrl
        ),
        paths.runtimeDir
      )
    ],
    '@shuvi/runtime/*': [
      path.relative(
        path.resolve(
          paths.rootDir,
          userTsConfig.compilerOptions.baseUrl || tsOptions.baseUrl
        ),
        paths.runtimeDir
      ) + '/*'
    ]
  };
  if (!pathAlias || Object.keys(pathAlias).length <= 0) {
    userTsConfig.compilerOptions.paths = shuviPaths;
    suggestedActions.push(
      chalk.cyan('compilerOptions.paths') +
        ' was set to include ' +
        chalk.bold(`"@shuvi/runtime" alias`)
    );
  } else {
    const keys = Object.keys(shuviPaths);
    for (const key of keys) {
      if (!pathAlias[key] || !isEqual(pathAlias[key], shuviPaths[key])) {
        pathAlias[key] = shuviPaths[key];
        suggestedActions.push(
          chalk.cyan('compilerOptions.paths') +
            ' was modified to include ' +
            chalk.bold(`"${key}" alias`)
        );
      }
    }
  }

  const toIncludes = ['.shuvi/app/shuvi-app.d.ts', 'src'];
  if (!('include' in rawConfig) || rawConfig.include.length === 0) {
    userTsConfig.include = toIncludes;
    suggestedActions.push(
      chalk.cyan('include') +
        ' was set to ' +
        chalk.bold(`['.shuvi/app/shuvi-app.d.ts', 'src']`)
    );
  } else {
    const includes = rawConfig.include as string[];
    const missed: string[] = [];
    for (let index = 0; index < toIncludes.length; index++) {
      const item = toIncludes[index];
      if (!includes.includes(item)) {
        missed.push(item);
      }
    }
    if (missed.length) {
      missed.forEach(item => userTsConfig.include.push(item));
      suggestedActions.push(
        chalk.cyan('include') +
          ' was modified to include ' +
          chalk.bold(`[${missed.map(item => `'${item}'`).join(', ')}]`)
      );
    }
  }

  if (!('exclude' in rawConfig)) {
    userTsConfig.exclude = ['node_modules'];
    suggestedActions.push(
      chalk.cyan('exclude') + ' was set to ' + chalk.bold(`['node_modules']`)
    );
  }

  if (suggestedActions.length < 1 && requiredActions.length < 1) {
    return;
  }

  await fs.writeFile(
    tsConfigPath,
    CommentJson.stringify(userTsConfig, null, 2) + os.EOL
  );

  if (isFirstTimeSetup) {
    return;
  }

  console.log(
    chalk.green(
      `We detected TypeScript in your project and reconfigured your ${chalk.bold(
        'tsconfig.json'
      )} file for you. Strict-mode is set to ${chalk.bold('false')} by default.`
    ) + '\n'
  );

  if (suggestedActions.length) {
    console.log(
      `The following suggested values were added to your ${chalk.cyan(
        'tsconfig.json'
      )}. These values ${chalk.bold(
        'can be changed'
      )} to fit your project's needs:\n`
    );

    suggestedActions.forEach(action => console.log(`\t- ${action}`));

    console.log('');
  }

  if (requiredActions.length) {
    console.log(
      `The following ${chalk.bold(
        'mandatory changes'
      )} were made to your ${chalk.cyan('tsconfig.json')}:\n`
    );

    requiredActions.forEach(action => console.log(`\t- ${action}`));

    console.log('');
  }
}
