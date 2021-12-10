import program from 'commander';
import path from 'path';
import { getApi, createShuviServer } from '@shuvi/service';
import { getPackageInfo } from '../utils';
import { getProjectDir, getConfigFromCli } from '../utils';

export default async function main(argv: string[]) {
  const pkgInfo = getPackageInfo();
  program
    .name(pkgInfo.name)
    .usage(`serve [dir] [options]`)
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
  const shuviApp = await createShuviServer(api.cliContext);
  try {
    await shuviApp.listen(port, host);
    console.log(`Ready on http://${host}:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
