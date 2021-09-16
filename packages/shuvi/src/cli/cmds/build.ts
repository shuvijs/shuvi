import program from 'commander';
import { build } from '@shuvi/service/lib/cli/apis/build';
//@ts-ignore
import pkgInfo from '../../../package.json';
import { getConfigFromCli } from '@shuvi/service/lib/config';
import getPlatform from '@shuvi/service/lib/lib/getPlatform';
interface CLIParams {
  publicPath?: string;
  target?: 'spa';
}

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
  const cliParams = program as CLIParams;
  const config = getConfigFromCli(program, cliConfigMap);
  const platform = getPlatform(config.platform.name);
  try {
    await build({
      config,
      target: cliParams.target,
      platform
    });
    console.log('Build successfully!');
  } catch (error) {
    console.error('Failed to build.\n');
    console.error((error as Error).message);

    process.exit(1);
  }
}
