import { inspect } from 'util';
import program from 'commander';
import { highlight } from 'cli-highlight';
import chalk from '@shuvi/utils/lib/chalk';
import { getApi } from '@shuvi/service';
import { getBundler } from '@shuvi/service/lib/bundler/bundler';
import { getConfigFromCli } from '@shuvi/service/lib/config';
import getPlatform from '@shuvi/service/lib/lib/getPlatform';
//@ts-ignore
import pkgInfo from '../../../package.json';

export default async function main(argv: string[]) {
  program
    .name(pkgInfo.name)
    .description('inspect internal webpack config')
    .usage('inspect [options] [...paths]')
    .helpOption()
    .option('--config <file>', 'path to config file')
    .option('--config-overrides [json]', 'config overrides json')
    .option('--mode <mode>', 'specify env mode (default: development)')
    .option('--verbose', 'show full webpack config')
    .parse(argv, { from: 'user' });

  const mode = ['development', 'production'].includes(program.mode)
    ? program.mode
    : 'development';

  Object.assign(process.env, {
    NODE_ENV: mode
  });
  const config = getConfigFromCli(program);
  const platform = getPlatform(config.platform.name);
  const api = await getApi({
    config,
    mode,
    platform,
    phase: 'PHASE_INSPECT_WEBPACK'
  });
  const bundler = getBundler(api);

  const configs = await bundler.resolveWebpackConfig();

  configs.forEach(({ name, config }) => {
    console.log(chalk.cyan.bold(`${name} webpack config`));
    const configString = inspect(config, { depth: program.verbose ? 10 : 2 });
    if (process.env.__DISABLE_HIGHLIGHT__ === 'true') {
      console.log(configString);
    } else {
      console.log(highlight(configString, { language: 'js' }));
    }
  });
}
