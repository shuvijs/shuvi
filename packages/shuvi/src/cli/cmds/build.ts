import program from 'commander';
import path from 'path';
import { build } from '@shuvi/service/lib/cli/apis/build';
//@ts-ignore
import pkgInfo from '../../../package.json';
import { getProjectDir, getConfigFromCli } from '../utils';

const cliConfigMap: Record<string, string | ((config: any) => void)> = {
  analyze: 'analyze',
  publicPath: 'publicPath',
  routerHistory: 'router.history',
  target(config) {
    config.ssr = false;
  }
};

export default async function main(argv: string[]) {
  program
    .name(pkgInfo.name)
    .usage(`build [dir] [options]`)
    .helpOption()
    .option('--config <file>', 'path to config file')
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
    .option('--config-overrides [json]', 'config overrides json')
    .parse(argv, { from: 'user' });
  const cwd = getProjectDir(program);
  const config = getConfigFromCli(program, cliConfigMap);
  try {
    await build({
      cwd,
      config,
      configFile: program.config && path.resolve(cwd, program.config),
      target: program.target
    });
    console.log('Build successfully!');
  } catch (error) {
    console.error('Failed to build.\n');
    console.error((error as Error).message);

    process.exit(1);
  }
}
