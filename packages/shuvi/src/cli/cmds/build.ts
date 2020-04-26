import program from 'commander';
import { loadConfig, IConfig } from '../../config';
import { build } from '../apis/build';
//@ts-ignore
import pkgInfo from '../../../package.json';
import { getProjectDir } from '../utils';

interface CliOptions {
  publicPath?: string;
  target?: 'spa';
}

const CliConfigMap: Record<string, string | ((config: any) => void)> = {
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

function applyCliOptions(cliOptions: Record<string, any>, config: IConfig) {
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
}

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
    .parse(argv, { from: 'user' });

  const dir = getProjectDir(program);
  const cliOpts = program as CliOptions;
  const config = await loadConfig(dir);
  applyCliOptions(cliOpts, config);

  try {
    await build(config, { target: cliOpts.target });
    console.log('Build successfully!');
  } catch (error) {
    console.error('Failed to build.\n');
    console.error(error.message);

    process.exit(1);
  }
}
