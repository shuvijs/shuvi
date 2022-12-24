import program from 'commander';
import * as path from 'path';
import logger from '@shuvi/utils/logger';
import { build } from '../tasks/build';
import { getPackageInfo, getProjectDir } from '../utils';
import { OptionsKeyMap, getConfigFromCli } from '../config';

const pkgInfo = getPackageInfo();

const cliConfigMap: OptionsKeyMap = {
  analyze: 'analyze',
  publicPath: 'publicPath',
  routerHistory: 'router.history',
  target(config, optionValue) {
    if (optionValue === 'spa') {
      config.ssr = false;
    }
  }
};

export default async function main(argv: string[]) {
  program
    .name(pkgInfo.name)
    .usage(`build [dir] [options]`)
    .helpOption()
    .option(
      '--public-path <url>',
      'specify the asset prefix. eg: https://some.cdn.com'
    )
    .option('--target <target>', 'specify the app output target. eg: spa')
    .option(
      '--router-history <history>',
      "specify the hisotry type. 'browser' or 'hash'"
    )
    .option('--analyze', 'generate html file to help analyze webpack bundle')
    .option('--config <file>', 'path to config file')
    .option('--config-overrides <json>', 'config overrides json')
    .parse(argv, { from: 'user' });
  const cwd = getProjectDir(program);
  const configFile = program.config && path.resolve(cwd, program.config);
  const config = await getConfigFromCli(program, cliConfigMap);
  try {
    await build({
      cwd,
      config,
      configFile
    });
    logger.info('Build successfully!');
  } catch (error) {
    logger.error('Failed to build.\n');
    logger.error((error as Error).message);

    process.exit(1);
  }
}
