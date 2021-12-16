import program from 'commander';
import path from 'path';
// @ts-ignore
import { shuvi, getApi, createShuviServer } from '@shuvi/service';
import { getPackageInfo, getProjectDir, getConfigFromCli } from '../utils';
import { loadConfig, getPlugins } from '../config';

export default async function main(argv: string[]) {
  const pkgInfo = getPackageInfo();
  program
    .name(pkgInfo.name)
    .usage(`dev [dir] [options]`)
    .helpOption()
    .option('--config <file>', 'path to config file')
    .option('--host <host>', 'specify host')
    .option('--port <port>', 'specify port')
    .option('--config-overrides [json]', 'config overrides json')
    .parse(argv, { from: 'user' });

  const cwd = getProjectDir(program);
  const port = Number(program.port) || 3000;
  const host = program.host || 'localhost';
  const config = loadConfig({
    dir: cwd,
    configFile: program.config && path.resolve(cwd, program.config),
    overrides: getConfigFromCli(program)
  });
  const plugins = getPlugins(config);
  const shuviApp = await createShuviServer({
    dev: true,
    rootDir: cwd,
    config: config,
    plugins
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
