import program from 'commander';
import { createShuviServer } from '@shuvi/service';
import { getPackageInfo, getProjectDir } from '../utils';
import { getConfigFromCli } from '../config';
import { initShuvi } from '../shuvi';

export default async function main(argv: string[]) {
  const pkgInfo = getPackageInfo();
  program
    .name(pkgInfo.name)
    .usage(`serve [dir] [options]`)
    .helpOption()
    .option('--host <host>', 'specify host')
    .option('--port <port>', 'specify port')
    .option('--config <file>', 'path to config file')
    .option('--config-overrides [json]', 'config overrides json')
    .parse(argv, { from: 'user' });
  const cwd = getProjectDir(program);
  const port = Number(program.port) || 3000;
  const host = program.host || 'localhost';
  const { plugins, presets, ...config } = await getConfigFromCli(cwd, program);
  const api = await initShuvi({
    cwd,
    config
  });
  const shuviApp = await createShuviServer({
    context: api.pluginContext,
    ...api.serverConfigs
  });
  try {
    await shuviApp.listen(port, host);
    console.log(`Ready on http://${host}:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
