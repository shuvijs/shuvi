import program from 'commander';
import { loadConfig } from '../../config';
import { shuvi } from '../../shuvi';
//@ts-ignore
import pkgInfo from '../../../package.json';
import { getProjectDir } from '../utils';

export default async function main(argv: string[]) {
  program
    .name(pkgInfo.name)
    .usage(`serve [dir] [options]`)
    .helpOption()
    .option('--host <host>', 'specify host')
    .option('--port <port>', 'specify port')
    .parse(argv, { from: 'user' });

  const dir = getProjectDir(program);
  const port = program.port || 3000;
  const host = program.host || 'localhost';

  const config = await loadConfig(dir);
  const shuviApp = shuvi({ config });
  try {
    await shuviApp.listen(port, host);
    console.log(`Ready on http://${host}:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
