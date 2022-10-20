import { inspect } from 'util';
import * as path from 'path';
import program from 'commander';
import chalk from '@shuvi/utils/lib/chalk';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import { getPackageInfo, getProjectDir, getConfigFromCli } from '../utils';
import { initShuvi } from '../shuvi';

export default async function main(argv: string[]) {
  const pkgInfo = getPackageInfo();
  program
    .name(pkgInfo.name)
    .description('inspect internal webpack config')
    .usage('inspect [options] [...paths]')
    .helpOption()
    .option('--mode <mode>', 'specify env mode (default: development)')
    .option('--verbose', 'show full webpack config')
    .option('--config <file>', 'path to config file')
    .option('--config-overrides [json]', 'config overrides json')
    .parse(argv, { from: 'user' });
  const cwd = getProjectDir(program);
  const mode = ['development', 'production'].includes(program.mode)
    ? program.mode
    : 'development';

  Object.assign(process.env, {
    NODE_ENV: mode
  });
  const configFilePath = program.config && path.resolve(cwd, program.config);
  let configFromCli = await getConfigFromCli(program);
  configFromCli = deepmerge(configFromCli, {
    typescript: {
      ignoreBuildErrors: true
    }
  });
  const api = await initShuvi({
    cwd,
    configFromCli,
    configFilePath,
    mode,
    phase: 'PHASE_INSPECT_WEBPACK'
  });
  await api.init();
  const bundler = await api.getBundler();
  const configs = await bundler.resolveTargetConfig();

  configs.forEach(({ name, config }) => {
    console.log(chalk.cyan.bold(`${name} webpack config`));
    const configString = inspect(config, { depth: program.verbose ? 10 : 2 });
    console.log(configString);
  });
}
