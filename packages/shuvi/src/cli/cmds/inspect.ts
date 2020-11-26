import { inspect } from 'util';
import program from 'commander';
import { highlight } from 'cli-highlight';
import chalk from '@shuvi/utils/lib/chalk';
import { getProjectDir } from '../utils';
import { getApi } from '../../api/api';
import { getBundler } from '../../bundler/bundler';
//@ts-ignore
import pkgInfo from '../../../package.json';

export default async function main(argv: string[]) {
  program
    .name(pkgInfo.name)
    .description('inspect internal webpack config')
    .usage('inspect [options] [...paths]')
    .helpOption()
    .option('--mode <mode>', 'specify env mode (default: development)')
    .option('--verbose', 'show full webpack config')
    .parse(argv, { from: 'user' });

  const cwd = getProjectDir(program);
  const mode = ['development', 'production'].includes(program.mode)
    ? program.mode
    : 'development';

  Object.assign(process.env, {
    NODE_ENV: mode
  });

  const api = await getApi({
    cwd,
    mode,
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
