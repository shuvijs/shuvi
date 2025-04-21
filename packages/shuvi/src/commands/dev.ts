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
  optionHostDev,
  optionPort,
  optionConfig,
  optionOverrides,
  DevOptions
} from './utils/options';

export default () => {
  const subCommand = new Command('dev');

  subCommand
    .usage(`[dir] [options]`)
    .description('run your project locally in development')
    .addArgument(argumentDir)
    .addOption(optionHostDev)
    .addOption(optionPort)
    .addOption(optionConfig)
    .addOption(optionOverrides)
    .action(devAction);

  return subCommand;
};

async function devAction(dir: string, options: DevOptions) {
  process.env.NODE_ENV = 'development';
  const startTime = performance.now();
  const cwd = getProjectDir(dir);
  const { host, port } = options;
  const configFile = options.config && path.resolve(cwd, options.config);
  const config = await getConfigFromCli(options);
  
  process.env.DEV_SERVER = `${host}:${port}`;
  const api = await initShuvi({
    cwd,
    config,
    configFile
  });

  await api.buildApp();
  const bundler = await api.getBundler();
  const shuviApp = await createShuviServer({
    context: api.pluginContext,
    dev: true,
    bundler,
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
  } catch (err: any) {
    if (err.code === 'EADDRINUSE') {
      let errorMessage = `Port ${port} is already in use.`;
      errorMessage += '\nUse `--port` to specify some other port.';
      // tslint:disable-next-line
      logger.error(errorMessage);
    } else {
      // tslint:disable-next-line
      logger.error(err);
    }
    await api.destory();
    process.nextTick(() => process.exit(1));
  }
}
