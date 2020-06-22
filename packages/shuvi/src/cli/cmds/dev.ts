import program from 'commander';
import path from 'path';
import { shuvi } from '../../shuvi';
//@ts-ignore
import pkgInfo from '../../../package.json';
import { getProjectDir } from '../utils';
import { CONFIG_FILE } from '@shuvi/shared/lib/constants';

export default async function main(argv: string[]) {
  program
    .name(pkgInfo.name)
    .usage(`dev [dir] [options]`)
    .helpOption()
    .option('--host <host>', 'specify host')
    .option('--port <port>', 'specify port')
    .parse(argv, { from: 'user' });

  const configFile = path.join(getProjectDir(program), CONFIG_FILE);
  const port = program.port || 3000;
  const host = program.host || 'localhost';

  const shuviApp = shuvi({ dev: true, configFile });

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
