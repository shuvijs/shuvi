import { Command } from 'commander';
import { existsSync } from 'fs';
import { join } from 'path';
import { deepmerge } from '@shuvi/utils/deepmerge';
import { getProjectDir, color } from '../utils';
import { getConfigFromCli } from '../config';
import { initShuvi } from '../shuvi';
import {
  optionDir,
  optionFile,
  optionStrict,
  optionConfig,
  optionExt,
  optionResolvePluginsRelativeTo,
  optionRulesDir,
  optionFix,
  optionFixType,
  optionIgnorePath,
  optionNoIgnore,
  optionQuiet,
  optionMaxWarnings,
  optionNoInlineConfig,
  optionReportUnusedDisableDirectives,
  optionNoCache,
  optionCacheLocation,
  optionCacheStrategy,
  optionErrorOnUnmatchedPattern,
  optionFormat,
  optionOutputFile
} from './eslint/options';
import { printAndExit } from './eslint/printAndExit';
import { setupTypeScript } from '@shuvi/service/lib/bundler/typescript/setupTypeScript';
import { runLintCheck } from './eslint/core/runLintCheck';
import { CompileError } from './eslint/compile-error';
import { argumentDir, optionMode, LintOptions } from './utils/options';

const eslintOptions = (
  options: EsLintOption,
  defaultCacheLocation: string
) => ({
  overrideConfigFile: options.config,
  extensions: options.ext,
  resolvePluginsRelativeTo: options.resolvePluginsRelativeTo,
  rulePaths: options.rulesDir,
  fix: options.fix,
  fixTypes: options.fixType,
  ignorePath: options.ignorePath,
  ignore: !Boolean(options.ignore),
  allowInlineConfig: !Boolean(options.inlineConfig),
  reportUnusedDisableDirectives: options.reportUnusedDisableDirectives,
  cache: !Boolean(options.cache),
  cacheLocation: options.cacheLocation || defaultCacheLocation,
  cacheStrategy: options.cacheStrategy,
  errorOnUnmatchedPattern: options.errorOnUnmatchedPattern
    ? Boolean(options.errorOnUnmatchedPattern)
    : false
});

export default () => {
  const subCommand = new Command('lint');

  subCommand
    .usage(`[dir] [options]`)
    .description(
      'Run ESLint on every file in specified directories. If not configured, ESLint will be set up for the first time.'
    )
    .addArgument(argumentDir)
    .addOption(optionMode)
    .addOption(optionDir)
    .addOption(optionFile)
    .addOption(optionStrict)
    .addOption(optionConfig)
    .addOption(optionExt)
    .addOption(optionResolvePluginsRelativeTo)
    .addOption(optionRulesDir)
    .addOption(optionFix)
    .addOption(optionFixType)
    .addOption(optionIgnorePath)
    .addOption(optionNoIgnore)
    .addOption(optionQuiet)
    .addOption(optionMaxWarnings)
    .addOption(optionNoInlineConfig)
    .addOption(optionReportUnusedDisableDirectives)
    .addOption(optionNoCache)
    .addOption(optionCacheLocation)
    .addOption(optionCacheStrategy)
    .addOption(optionErrorOnUnmatchedPattern)
    .addOption(optionFormat)
    .addOption(optionOutputFile)
    .action(lintAction);

  return subCommand;
};

type EsLintOption = {
  dir: string[];
  file: string[];
  strict: boolean;
  config: null | string;
  ext: string[];
  resolvePluginsRelativeTo: null | string;
  rulesDir: string[];
  fix: boolean;
  fixType: null | string[];
  ignorePath: null | string[];
  ignore: boolean;
  quiet: boolean;
  maxWarnings: number;
  inlineConfig: boolean;
  reportUnusedDisableDirectives: null | string[];
  cache: boolean;
  cacheLocation: string;
  cacheStrategy: string;
  errorOnUnmatchedPattern: boolean;
  format: string;
  outputFile: null | string;
};

export async function lintAction(
  dir: string,
  options: LintOptions & EsLintOption
) {
  const { mode } = options;
  Object.assign(process.env, {
    NODE_ENV: mode
  });
  console.log('options: ', options);
  const cwd = getProjectDir(dir);

  let config = await getConfigFromCli(options);
  config = deepmerge(config, {
    typescript: {
      ignoreBuildErrors: true
    }
  });
  const api = await initShuvi({
    cwd,
    config,
    configFile: '',
    mode,
    phase: 'PHASE_DEVELOPMENT_SERVER'
  });
  await api.init();
  const files: string[] = options['file'];
  const dirs: string[] = options['dir'];
  const filesToLint = [...dirs, ...files];

  const directoriesToLint = ['src'];

  const pathsToLint = (
    filesToLint.length ? filesToLint : directoriesToLint
  ).reduce((res: string[], d: string) => {
    const currDir = join(cwd, d);
    if (!existsSync(currDir)) {
      return res;
    }
    res.push(currDir);
    return res;
  }, []);

  const reportErrorsOnly = Boolean(options['quiet']);
  const maxWarnings = options['maxWarnings'];
  const formatter = options['format'];
  const strict = Boolean(options['strict']);
  const outputFile = options['outputFile'];

  const paths = api.pluginContext.paths;
  const defaultCacheLocation = join(paths.cacheDir, options.cacheLocation);
  const hasAppDir = false;

  await setupTypeScript(paths, {
    reportMissingError: false
  });

  runLintCheck(cwd, pathsToLint, hasAppDir, {
    lintDuringBuild: false,
    eslintOptions: eslintOptions(options, defaultCacheLocation),
    reportErrorsOnly: reportErrorsOnly,
    maxWarnings,
    formatter,
    outputFile,
    strict
  })
    .then(async lintResults => {
      const lintOutput =
        typeof lintResults === 'string' ? lintResults : lintResults?.output;

      if (
        typeof lintResults !== 'string' &&
        lintResults?.isError &&
        lintOutput
      ) {
        throw new CompileError(lintOutput);
      }

      if (lintOutput) {
        printAndExit(lintOutput, 0);
      } else if (lintResults && !lintOutput) {
        printAndExit(color.blue('✔ No ESLint warnings or errors'), 0);
      }
    })
    .catch((err: Error) => {
      printAndExit(err.message);
    });
}
