import program from 'commander';
import path from 'path';
import { build } from '../apis/build';
//@ts-ignore
import pkgInfo from '../../../package.json';
import { getProjectDir } from '../utils';

interface CLIParams {
  publicPath?: string;
  target?: 'spa';
}

const CliConfigMap: Record<string, string | ((config: any) => void)> = {
  analyze: 'analyze',
  publicPath: 'publicPath',
  routerHistory: 'router.history',
  target(config) {
    config.ssr = false;
  }
};

function set(obj: any, path: string, value: any) {
  const segments = path.split('.');
  const final = segments.pop()!;
  for (var i = 0; i < segments.length; i++) {
    if (!obj) {
      return;
    }
    obj = obj[segments[i]];
  }
  obj[final] = value;
}

function getConfigFromCli(cliOptions: Record<string, any>) {
  const config = {};
  Object.keys(CliConfigMap).forEach(key => {
    if (typeof program[key] !== 'undefined') {
      const value = CliConfigMap[key];
      if (typeof value === 'function') {
        value(config);
      } else {
        set(config, value, cliOptions[key]);
      }
    }
  });
  return config;
}

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
    .parse(argv, { from: 'user' });

  const cwd = getProjectDir(program);
  const cliParams = program as CLIParams;
  const config = getConfigFromCli(cliParams);

  try {
    await build({
      cwd,
      config,
      configFile: program.config && path.resolve(cwd, program.config),
      target: cliParams.target
    });
    console.log('Build successfully!');
  } catch (error) {
    console.error('Failed to build.\n');
    console.error({ error });
    console.error(error.message);

    process.exit(1);
  }
}
