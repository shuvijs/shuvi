import { existsSync } from 'fs';
import path from 'path';
import { CommanderStatic } from 'commander';
import { ShuviServerConfig } from '@shuvi/service';
//@ts-ignore
import pkgInfo from '../package.json';

export function getPackageInfo() {
  return pkgInfo;
}

export function getProjectDir(
  cmd: CommanderStatic | Record<string, any>
): string {
  const dir = path.resolve(cmd.args[0] || '.');
  if (!existsSync(dir)) {
    console.error(`> No such directory exists as the project root: ${dir}`);
    cmd.outputHelp();
    process.exit(1);
  }
  return dir;
}

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

export function getConfigFromCli(
  cliOptions: Record<string, any>,
  cliOptionsKeyMap: Record<
    string,
    string | ((config: any, optionValue: any) => void)
  > = {}
): ShuviServerConfig {
  const config = {};
  Object.keys(cliOptionsKeyMap).forEach(key => {
    if (typeof cliOptions[key] !== 'undefined') {
      const mappedKeyOrFunction = cliOptionsKeyMap[key];
      const cliOptionValue = cliOptions[key];
      if (typeof mappedKeyOrFunction === 'function') {
        mappedKeyOrFunction(config, cliOptionValue);
      } else {
        set(config, mappedKeyOrFunction, cliOptionValue);
      }
    }
  });
  try {
    const { configOverrides } = cliOptions;
    if (configOverrides) {
      const overrides = JSON.parse(configOverrides);
      Object.assign(config, overrides);
    }
  } catch (err) {
    console.error(err);
  }
  return config;
}
