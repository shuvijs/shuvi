import program from 'commander';
import path from 'path';
// @ts-ignore
import { shuvi, getApi, createShuviServer } from '@shuvi/service';
import { getPackageInfo } from '../utils';
import { getProjectDir, getConfigFromCli } from '../utils';
// import dev from '@shuvi/service/lib/cmds/dev'

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
  const config = getConfigFromCli(program);
  const api = await getApi({
    cwd,
    config,
    configFile: program.config && path.resolve(cwd, program.config)
  });
  await api.buildApp();
  const shuviApp = await createShuviServer(api.cliContext, true);
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
