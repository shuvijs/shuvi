import program = require('commander');
import { build } from '../tasks/build';
import { getPackageInfo } from '../utils';
import {
  getProjectDir,
  getConfigFromCli,
  getPlatform,
  OptionsKeyMap
} from '../utils';

const pkgInfo = getPackageInfo();

const cliConfigMap: OptionsKeyMap = {
  analyze: 'analyze',
  publicPath: 'publicPath',
  routerHistory: 'router.history',
  target(config, optionValue) {
    if (optionValue === 'spa') {
      config.ssr = false;
      config.platform = { name: 'web', framework: 'react', target: 'spa' };
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
  const config = await getConfigFromCli(cwd, program, cliConfigMap);
  const platform = getPlatform(config.platform.name);
  try {
    await build({
      cwd,
      config,
      platform
    });
    console.log('Build successfully!');
  } catch (error) {
    console.error('Failed to build.\n');
    console.error((error as Error).message);

    process.exit(1);
  }
}
