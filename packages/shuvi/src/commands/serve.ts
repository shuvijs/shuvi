import { performance } from 'perf_hooks';
import { Command } from 'commander';
import * as path from 'path';
import { createShuviServer } from '@shuvi/service';
import logger from '@shuvi/utils/logger';
import { getProjectDir, printStartupInfo } from '../utils';
import { getConfigFromCli } from '../config';
import { initShuvi } from '../shuvi';

import {
  argumentDir,
  optionHostServe,
  optionPort,
  optionConfig,
  optionOverrides,
  ServeOptions
} from './utils/options';

export default () => {
  const subCommand = new Command('serve');

  subCommand
    .usage(`[dir] [options]`)
    .description('serve your project')
    .addArgument(argumentDir)
    .addOption(optionHostServe)
    .addOption(optionPort)
    .addOption(optionConfig)
    .addOption(optionOverrides)
    .action(serveAction);

  return subCommand;
};

async function serveAction(dir: string, options: ServeOptions) {
  const startTime = performance.now();
  process.env.NODE_ENV = 'production';

  const { host, port } = options;
  const cwd = getProjectDir(dir);
  const configFile = options.config && path.resolve(cwd, options.config);
  const config = await getConfigFromCli(options);
  const api = await initShuvi({
    cwd,
    config,
    configFile
  });
  const shuviApp = await createShuviServer({
    context: api.pluginContext,
    ...api.serverConfigs
  });
  try {
    await shuviApp.listen(port, host);

    printStartupInfo({
      startTime,
      readyTime: performance.now(),
      host,
      port
    });
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}
