/* eslint-disable @typescript-eslint/no-explicit-any */
import { promises } from 'fs';
import chalk from 'chalk';
import path from 'path';

import findUp from 'find-up';
import semver from 'semver';
import * as CommentJson from 'comment-json';

import { LintResult, formatResults } from './customFormatter';
import { writeDefaultConfig } from './writeDefaultConfig';
import { hasEslintConfiguration } from './hasEslintConfiguration';
import { writeOutputFile } from './writeOutputFile';

import { existsSync, findPagesDir } from '../find-pages-dir';
import { installDependencies } from '../install-dependencies';
import { hasNecessaryDependencies } from '../has-necessary-dependencies';

import isError, { getProperError } from '../is-error';
import { getPkgManager } from '../helpers/get-pkg-manager';

type Config = {
  plugins: string[];
  rules: { [key: string]: Array<number | string> };
};

// 0 is off, 1 is warn, 2 is error. See https://eslint.org/docs/user-guide/configuring/rules#configuring-rules
const VALID_SEVERITY = ['off', 'warn', 'error'] as const;
type Severity = typeof VALID_SEVERITY[number];

function isValidSeverity(severity: string): severity is Severity {
  return VALID_SEVERITY.includes(severity as Severity);
}

const requiredPackages = [
  { file: 'eslint', pkg: 'eslint', exportsRestrict: false },
  {
    file: 'eslint-config-shuvi',
    pkg: 'eslint-config-shuvi',
    exportsRestrict: false
  }
];

export const ESLINT_PROMPT_VALUES = [
  {
    title: 'Base configuration (recommended)',
    config: {
      extends: 'shuvi'
    }
  },
  {
    title: 'Cancel',
    config: null
  }
];

async function cliPrompt() {
  console.log(
    chalk.bold(
      `${chalk.cyan(
        '?'
      )} How would you like to configure ESLint? https://shuvijs.github.io/shuvijs.org/docs/guides/ESLint`
    )
  );

  try {
    const cliSelect = (await Promise.resolve(require('cli-select'))).default;
    const { value } = await cliSelect({
      values: ESLINT_PROMPT_VALUES,
      valueRenderer: (
        {
          title,
          recommended
        }: { title: string; recommended?: boolean; config: any },
        selected: boolean
      ) => {
        const name = selected ? chalk.bold.underline.cyan(title) : title;
        return name + (recommended ? chalk.bold.yellow(' (recommended)') : '');
      },
      selected: chalk.cyan('❯ '),
      unselected: '  '
    });

    return { config: value?.config };
  } catch {
    return { config: null };
  }
}

async function lint(
  baseDir: string,
  lintDirs: string[],
  eslintrcFile: string | null,
  pkgJsonPath: string | null,
  {
    lintDuringBuild = false,
    eslintOptions = null,
    reportErrorsOnly = false,
    maxWarnings = -1,
    formatter = null,
    outputFile = null
  }: {
    lintDuringBuild: boolean;
    eslintOptions: any;
    reportErrorsOnly: boolean;
    maxWarnings: number;
    formatter: string | null;
    outputFile: string | null;
  }
): Promise<
  | string
  | null
  | {
      output: string | null;
      isError: boolean;
      eventInfo: any;
    }
> {
  try {
    // Load ESLint after we're sure it exists:
    const deps = await hasNecessaryDependencies(baseDir, requiredPackages);
    const packageManager = getPkgManager(baseDir);

    if (deps.missing.some(dep => dep.pkg === 'eslint')) {
      console.error(
        `ESLint must be installed${
          lintDuringBuild ? ' in order to run during builds:' : ':'
        } ${chalk.bold.cyan(
          `${
            packageManager === 'yarn'
              ? 'yarn add --dev'
              : packageManager === 'pnpm'
              ? 'pnpm install --save-dev'
              : 'npm install --save-dev'
          } eslint`
        )}`
      );
      return null;
    }

    const mod = await Promise.resolve(require(deps.resolved.get('eslint')!));

    const { ESLint } = mod;
    let eslintVersion = ESLint?.version ?? mod?.CLIEngine?.version;

    if (!eslintVersion || semver.lt(eslintVersion, '7.0.0')) {
      return `${chalk.red(
        'error'
      )} - Your project has an older version of ESLint installed${
        eslintVersion ? ` (${eslintVersion})` : ''
      }. Please upgrade to ESLint version 7 or above`;
    }

    let options: any = {
      useEslintrc: true,
      baseConfig: {},
      errorOnUnmatchedPattern: false,
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      cache: true,
      ...eslintOptions
    };

    let eslint = new ESLint(options);

    let shuviEslintPluginIsEnabled = false;
    const shuviRulesEnabled = new Map<string, Severity>();

    for (const configFile of [eslintrcFile, pkgJsonPath]) {
      if (!configFile) {
        continue;
      }

      const completeConfig: Config = await eslint.calculateConfigForFile(
        configFile
      );

      if (completeConfig.plugins?.includes('@shuvi/shuvi')) {
        shuviEslintPluginIsEnabled = true;
        for (const [name, [severity]] of Object.entries(completeConfig.rules)) {
          if (!name.startsWith('@shuvi/shuvi/')) {
            continue;
          }
          if (
            typeof severity === 'number' &&
            severity >= 0 &&
            severity < VALID_SEVERITY.length
          ) {
            shuviRulesEnabled.set(name, VALID_SEVERITY[severity]);
          } else if (
            typeof severity === 'string' &&
            isValidSeverity(severity)
          ) {
            shuviRulesEnabled.set(name, severity);
          }
        }
        break;
      }
    }

    const pagesDir = findPagesDir(baseDir);
    const pagesDirRules = pagesDir
      ? ['@shuvi/shuvi/no-html-link-for-pages']
      : [];

    if (shuviEslintPluginIsEnabled) {
      let updatedPagesDir = false;

      for (const rule of pagesDirRules) {
        if (
          !options.baseConfig!.rules?.[rule] &&
          !options.baseConfig!.rules?.[
            rule.replace('@shuvi/shuvi', '@shuvi/babel-plugin-shuvi')
          ]
        ) {
          if (!options.baseConfig!.rules) {
            options.baseConfig!.rules = {};
          }
          options.baseConfig!.rules[rule] = [1, pagesDir];
          updatedPagesDir = true;
        }
      }

      if (updatedPagesDir) {
        eslint = new ESLint(options);
      }
    } else {
      console.warn(
        'The Shuvi.js plugin was not detected in your ESLint configuration. https://shuvijs.github.io/shuvijs.org/docs/guides/ESLint#migrating-existing-config'
      );
    }

    const lintStart = process.hrtime();

    let results = await eslint.lintFiles(lintDirs);
    let selectedFormatter = null;

    if (options.fix) {
      await ESLint.outputFixes(results);
    }
    if (reportErrorsOnly) {
      results = await ESLint.getErrorResults(results);
    } // Only return errors if --quiet flag is used

    if (formatter) {
      selectedFormatter = await eslint.loadFormatter(formatter);
    }
    const formattedResult = formatResults(
      baseDir,
      results,
      selectedFormatter?.format
    );
    const lintEnd = process.hrtime(lintStart);
    const totalWarnings = results.reduce(
      (sum: number, file: LintResult) => sum + file.warningCount,
      0
    );

    if (outputFile) {
      await writeOutputFile(outputFile, formattedResult.output);
    }

    return {
      output: formattedResult.outputWithMessages,
      isError:
        ESLint.getErrorResults(results)?.length > 0 ||
        (maxWarnings >= 0 && totalWarnings > maxWarnings),
      eventInfo: {
        durationInSeconds: lintEnd[0],
        eslintVersion: eslintVersion,
        lintedFilesCount: results.length,
        lintFix: !!options.fix,
        shuviEslintPluginVersion:
          shuviEslintPluginIsEnabled && deps.resolved.has('eslint-config-shuvi')
            ? require(path.join(
                path.dirname(deps.resolved.get('eslint-config-shuvi')!),
                'package.json'
              )).version
            : null,
        shuviEslintPluginErrorsCount:
          formattedResult.totalShuviPluginErrorCount,
        shuviEslintPluginWarningsCount:
          formattedResult.totalShuviPluginWarningCount,
        shuviRulesEnabled: Object.fromEntries(shuviRulesEnabled)
      }
    };
  } catch (err) {
    if (lintDuringBuild) {
      console.error(
        `ESLint: ${
          isError(err) && err.message ? err.message.replace(/\n/g, ' ') : err
        }`
      );
      return null;
    } else {
      throw getProperError(err);
    }
  }
}

export async function runLintCheck(
  baseDir: string,
  lintDirs: string[],
  opts: {
    lintDuringBuild?: boolean;
    eslintOptions?: any;
    reportErrorsOnly?: boolean;
    maxWarnings?: number;
    formatter?: string | null;
    outputFile?: string | null;
    strict?: boolean;
  }
): ReturnType<typeof lint> {
  const {
    lintDuringBuild = false,
    eslintOptions = null,
    reportErrorsOnly = false,
    maxWarnings = -1,
    formatter = null,
    outputFile = null,
    strict = false
  } = opts;
  try {
    // Find user's .eslintrc file
    // See: https://eslint.org/docs/user-guide/configuring/configuration-files#configuration-file-formats
    const eslintrcFile =
      (await findUp(
        [
          '.eslintrc.js',
          '.eslintrc.cjs',
          '.eslintrc.yaml',
          '.eslintrc.yml',
          '.eslintrc.json',
          '.eslintrc'
        ],
        {
          cwd: baseDir
        }
      )) ?? null;

    const pkgJsonPath =
      (await findUp('package.json', { cwd: baseDir })) ?? null;
    let packageJsonConfig = null;
    if (pkgJsonPath) {
      const pkgJsonContent = await promises.readFile(pkgJsonPath, {
        encoding: 'utf8'
      });
      packageJsonConfig = CommentJson.parse(pkgJsonContent);
    }

    const config = await hasEslintConfiguration(
      eslintrcFile,
      packageJsonConfig
    );
    let deps;

    if (config.exists) {
      // Run if ESLint config exists
      return await lint(baseDir, lintDirs, eslintrcFile, pkgJsonPath, {
        lintDuringBuild,
        eslintOptions,
        reportErrorsOnly,
        maxWarnings,
        formatter,
        outputFile
      });
    } else {
      // Display warning if no ESLint configuration is present inside
      // config file during "shuvi build", no warning is shown when
      // no eslintrc file is present
      if (lintDuringBuild) {
        if (config.emptyPkgJsonConfig || config.emptyEslintrc) {
          console.warn(
            `No ESLint configuration detected. Run ${chalk.bold.cyan(
              'shuvi lint'
            )} to begin setup`
          );
        }
        return null;
      } else {
        // Ask user what config they would like to start with for first time "shuvi lint" setup
        const { config: selectedConfig } = strict
          ? ESLINT_PROMPT_VALUES.find(
              (opt: { title: string }) => opt.title === 'Strict'
            )!
          : await cliPrompt();

        if (selectedConfig == null) {
          // Show a warning if no option is selected in prompt
          console.warn(
            'If you set up ESLint yourself, we recommend adding the Shuvi.js ESLint plugin. See https://shuvijs.github.io/shuvijs.org/docs/guides/ESLint#migrating-existing-config'
          );
          return null;
        } else {
          // Check if necessary deps installed, and install any that are missing
          deps = await hasNecessaryDependencies(baseDir, requiredPackages);
          if (deps.missing.length > 0) {
            await installDependencies(baseDir, deps.missing, true);
          }

          // Write default ESLint config.
          // Check for and src/routes is to make sure this happens in Shuvi.js folder
          if (existsSync(path.join(baseDir, 'src/routes'))) {
            await writeDefaultConfig(
              baseDir,
              config,
              selectedConfig,
              eslintrcFile,
              pkgJsonPath,
              packageJsonConfig
            );
          }
        }

        console.info(
          `ESLint has successfully been configured. Run ${chalk.bold.cyan(
            'shuvi lint'
          )} again to view warnings and errors.`
        );

        return null;
      }
    }
  } catch (err) {
    throw err;
  }
}
