import program from 'commander';
import path from 'path';
import { IConfig, shuvi } from '../../shuvi';
//@ts-ignore
import pkgInfo from '../../../package.json';
import { getProjectDir } from '../utils';

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

  const cwd = getProjectDir(program);
  const port = Number(program.port) || 3000;
  const host = program.host || 'localhost';
  let config: IConfig = {};
  try {
    const { configOverrides } = program;
    if (configOverrides) {
      const overrides = JSON.parse(configOverrides);
      config = overrides;
    }
  } catch (err) {
    console.error(err);
  }

  const shuviApp = shuvi({
    dev: true,
    cwd,
    config,
    configFile: program.config && path.resolve(cwd, program.config)
  });

  try {
    console.log('Starting the development server...', process.env.NODE_ENV);
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
