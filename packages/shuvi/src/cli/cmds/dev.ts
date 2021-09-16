import program from 'commander';
import { shuvi } from '@shuvi/service';
//@ts-ignore
import pkgInfo from '../../../package.json';
import { getConfigFromCli } from '@shuvi/service/lib/config';
import getPlatform from '@shuvi/service/lib/lib/getPlatform';

export default async function main(argv: string[]) {
  program
    .name(pkgInfo.name)
    .usage(`dev [dir] [options]`)
    .helpOption()
    .option('--config <file>', 'path to config file')
    .option('--host <host>', 'specify host')
    .option('--port <port>', 'specify port')
    .option('--config-overrides [json]', 'config overrides json')
    .parse(argv, { from: 'user' });

  const port = Number(program.port) || 3000;
  const host = program.host || 'localhost';
  const config = getConfigFromCli(program);
  const platform = getPlatform(config.platform.name);
  const shuviOptions = {
    dev: true,
    config,
    platform
  };

  const shuviApp = shuvi(shuviOptions);

  try {
    console.log('Starting the development server...');
    await shuviApp.listen(port, host);
    const localUrl = `http://${
      host === '0.0.0.0' ? 'localhost' : host
    }:${port}`;
    console.log(`Ready on ${localUrl}`);
  } catch (err) {
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
