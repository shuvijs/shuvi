import program from 'commander';
import { createShuviServer, getConfigFromCli } from '@shuvi/service';
import logger from '@shuvi/utils/lib/logger';
import { getPackageInfo, getProjectDir, printStartupInfo } from '../utils';
import { initShuvi } from '../shuvi';

export default async function main(argv: string[]) {
  const startTime = performance.now();
  const pkgInfo = getPackageInfo();
  program
    .name(pkgInfo.name)
    .usage(`serve [dir] [options]`)
    .helpOption()
    .option('--host <host>', 'specify host')
    .option('--port <port>', 'specify port')
    .option('--config <file>', 'path to config file')
    .option('--config-overrides [json]', 'config overrides json')
    .parse(argv, { from: 'user' });
  const cwd = getProjectDir(program);
  const port = Number(program.port) || 3000;
  const host = program.host || '0.0.0.0';
  const config = await getConfigFromCli(cwd, program);
  const api = await initShuvi({
    cwd,
    config
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
