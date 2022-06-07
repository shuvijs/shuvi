import program = require('commander');
import { getApi, createShuviServer } from '@shuvi/service';
import { getPackageInfo } from '../utils';
import { getProjectDir, getConfigFromCli, getPlatform } from '../utils';

export default async function main(argv: string[]) {
  const pkgInfo = getPackageInfo();
  program
    .name(pkgInfo.name)
    .usage(`dev [dir] [options]`)
    .helpOption()
    .option('--host <host>', 'specify host')
    .option('--port <port>', 'specify port')
    .option('--config <file>', 'path to config file')
    .option('--config-overrides <json>', 'config overrides json')
    .parse(argv, { from: 'user' });

  const cwd = getProjectDir(program);
  const port = Number(program.port) || 3000;
  const host = program.host || 'localhost';
  const config = await getConfigFromCli(cwd, program);
  const platform = getPlatform(config.platform.name);
  const api = await getApi({
    cwd,
    config,
    platform
  });
  await api.buildApp();
  const shuviApp = await createShuviServer({
    context: api.pluginContext,
    dev: true,
    ...api.serverConfigs
  });
  try {
    console.log('Starting the development server...');
    await shuviApp.listen(port, host);
    const localUrl = `http://${
      host === '0.0.0.0' ? 'localhost' : host
    }:${port}`;
    console.log(`Ready on ${localUrl}`);
  } catch (err: any) {
    if (err.code === 'EADDRINUSE') {
      let errorMessage = `Port ${port} is already in use.`;
      errorMessage += '\nUse `--port` to specify some other port.';
      // tslint:disable-next-line
      console.error(errorMessage);
    } else {
      // tslint:disable-next-line
      console.error(err);
    }
    process.nextTick(() => process.exit(1));
  }
}
