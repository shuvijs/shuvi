import chalk from '@shuvi/utils/lib/chalk';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { IPaths } from '../../core/apiTypes';
import { TypeScriptModule, TsConfig } from './types';

export async function writeDefaultConfigurations(
  ts: TypeScriptModule,
  tsConfigPath: string,
  tsConfig: TsConfig,
  paths: IPaths
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
      reason: 'requirement for redox'
    },
    module: {
      parsedValue: ts.ModuleKind.ESNext,
      // All of these values work:
      parsedValues: [
        ts.ModuleKind.ES2020,
        ts.ModuleKind.ESNext,
        ts.ModuleKind.CommonJS,
        ts.ModuleKind.AMD
      ],
      value: 'esnext',
      reason: 'for dynamic import() support'
    },
    moduleResolution: {
      parsedValue: ts.ModuleResolutionKind.NodeJs,
      // All of these values work:
      parsedValues: [
        ts.ModuleResolutionKind.NodeJs,
        ts.ModuleResolutionKind.Node16,
        ts.ModuleResolutionKind.NodeNext
      ],
      value: 'node',
      reason: 'to match webpack resolution'
    },
    resolveJsonModule: { value: true, reason: 'to match webpack resolution' },
    isolatedModules: {
      value: true,
      reason: 'requirement for SWC / Babel'
    },
    jsx: { parsedValue: ts.JsxEmit.Preserve, value: 'preserve' }
  };

  const userTsConfig = await fs.readJSON(tsConfigPath, {
    encoding: 'utf8'
  });
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
  userTsConfig.compilerOptions.paths = {
    ...tsOptions.paths,
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

  if (!('include' in rawConfig)) {
    userTsConfig.include = ['.shuvi/app/types-plugin-extended.d.ts', 'src'];
    suggestedActions.push(
      chalk.cyan('include') +
        ' was set to ' +
        chalk.bold(`['.shuvi/app/types-plugin-extended.d.ts', 'src']`)
    );
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
    JSON.stringify(userTsConfig, null, 2).replace(/\n/g, os.EOL) + os.EOL
  );

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
