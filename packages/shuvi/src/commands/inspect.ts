import { Command } from 'commander';
import { inspect } from 'util';
import * as path from 'path';
import chalk from '@shuvi/utils/chalk';
import { deepmerge } from '@shuvi/utils/deepmerge';
import { getProjectDir } from '../utils';
import { getConfigFromCli } from '../config';
import { initShuvi } from '../shuvi';

import {
  argumentDir,
  optionMode,
  optionVerbose,
  optionConfig,
  optionOverrides,
  InspectOptions
} from './utils/options';

export default () => {
  const subCommand = new Command('inspect');

  subCommand
    .usage(`[dir] [options]`)
    .description('inspect internal webpack config')
    .addArgument(argumentDir)
    .addOption(optionMode)
    .addOption(optionVerbose)
    .addOption(optionConfig)
    .addOption(optionOverrides)
    .action(inspectAction);

  return subCommand;
};

async function inspectAction(dir: string, options: InspectOptions) {
  const { mode, verbose } = options;
  Object.assign(process.env, {
    NODE_ENV: mode
  });
  const cwd = getProjectDir(dir);
  const configFile = options.config && path.resolve(cwd, options.config);
  let config = await getConfigFromCli(options);
  config = deepmerge(config, {
    typescript: {
      ignoreBuildErrors: true
    }
  });
  const api = await initShuvi({
    cwd,
    config,
    configFile,
    mode,
    phase: 'PHASE_INSPECT_WEBPACK'
  });
  await api.init();
  const bundler = await api.getBundler();
  const configs = await bundler.resolveTargetConfig();

  configs.forEach(({ name, config }) => {
    console.log(chalk.cyan.bold(`${name} webpack config`));
    const configString = inspect(config, { depth: verbose ? 10 : 2 });
    console.log(configString);
  });
}
