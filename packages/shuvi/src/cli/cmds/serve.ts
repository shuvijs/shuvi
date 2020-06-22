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
    .usage(`serve [dir] [options]`)
    .helpOption()
    .option('--host <host>', 'specify host')
    .option('--port <port>', 'specify port')
    .parse(argv, { from: 'user' });

  const configFile = path.join(getProjectDir(program), CONFIG_FILE);
  const port = program.port || 3000;
  const host = program.host || 'localhost';

  const shuviApp = shuvi({ configFile });
  try {
    await shuviApp.listen(port, host);
    console.log(`Ready on http://${host}:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
