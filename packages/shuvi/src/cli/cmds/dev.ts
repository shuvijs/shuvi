import program from 'commander';
import { loadConfig } from '../../config';
import { shuvi } from '../../shuvi';
//@ts-ignore
import pkgInfo from '../../../package.json';
import { getProjectDir } from '../utils';

export default async function main(argv: string[]) {
  program
    .name(pkgInfo.name)
    .usage(`dev [dir] [options]`)
    .helpOption()
    .option('--host <host>', 'specify host')
    .option('--port <port>', 'specify port')
    .parse(argv, { from: 'user' });

  const dir = getProjectDir(program);
  const port = program.port || 3000;
  const host = program.host || 'localhost';

  const config = await loadConfig(dir);
  const shuviApp = shuvi({ dev: true, config });

  try {
    await shuviApp.listen(port, host);
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
