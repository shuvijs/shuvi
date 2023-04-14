import { Command } from 'commander';
import * as path from 'path';
import logger from '@shuvi/utils/logger';
import { build } from '../tasks/build';
import { getProjectDir } from '../utils';
import { OptionsKeyMap, getConfigFromCli } from '../config';

import {
  argumentDir,
  optionPublicPath,
  optionTarget,
  optionRouterHistory,
  optionAnalyze,
  optionConfig,
  optionOverrides,
  BuildOptions
} from './utils/options';

const cliConfigMap: OptionsKeyMap = {
  analyze: 'analyze',
  publicPath: 'publicPath',
  routerHistory: 'router.history',
  target(config, optionValue) {
    if (optionValue === 'spa') {
      config.ssr = false;
    }
  }
};

export default () => {
  const subCommand = new Command('build');

  subCommand
    .usage(`[dir] [options]`)
    .description('build your project')
    .addArgument(argumentDir)
    .addOption(optionPublicPath)
    .addOption(optionTarget)
    .addOption(optionRouterHistory)
    .addOption(optionAnalyze)
    .addOption(optionConfig)
    .addOption(optionOverrides)
    .action(buildAction);

  return subCommand;
};

async function buildAction(dir: string, options: BuildOptions) {
  process.env.NODE_ENV = 'production';
  const cwd = getProjectDir(dir);
  const configFile = options.config && path.resolve(cwd, options.config);
  const config = await getConfigFromCli(options, cliConfigMap);
  try {
    await build({
      cwd,
      config,
      configFile
    });
    logger.info('Build successfully!');
  } catch (error) {
    logger.error('Failed to build.\n');
    logger.error((error as Error).message);

    process.exit(1);
  }
}
