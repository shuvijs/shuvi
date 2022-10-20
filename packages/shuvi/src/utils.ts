import { existsSync } from 'fs';
import * as path from 'path';
import { CommanderStatic } from 'commander';
import logger from '@shuvi/utils/lib/logger';
import chalk from '@shuvi/utils/lib/chalk';
import { ShuviConfig } from '@shuvi/service';
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
    logger.error(`> No such directory exists as the project root: ${dir}`);
    cmd.outputHelp();
    process.exit(1);
  }
  return dir;
}

export function printStartupInfo({
  startTime,
  readyTime,
  host,
  port
}: {
  startTime: number;
  readyTime: number;
  host: string;
  port: number;
}): void {
  const appUrl = `http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`;
  const readyMsg = chalk.dim(
    `ready in ${chalk.white(chalk.bold(Math.ceil(readyTime - startTime)))} ms`
  );

  logger.info(
    `\n  ${chalk.green(
      `${chalk.bold('Shuvi')} v${pkgInfo.version}`
    )} ${readyMsg}\n`
  );

  const colorUrl = (url: string) =>
    chalk.cyan(url.replace(/:(\d+)\//, (_, port) => `:${chalk.bold(port)}/`));

  logger.info(
    `  ${chalk.green('➜')}  ${chalk.bold('Local')}:   ${colorUrl(appUrl)} \n`
  );
}

export type OptionsKeyMap = Record<
  string,
  string | ((config: any, optionValue: any) => void)
>;

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

function getConfigFromCliOtherOptions(
  cliOptions: Record<string, any>,
  cliOptionsKeyMap: OptionsKeyMap = {}
): ShuviConfig {
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
    logger.error(err);
  }
  return config;
}

export async function getConfigFromCli(
  cliOptions: Record<string, any>,
  cliOptionsKeyMap: OptionsKeyMap = {}
): Promise<ShuviConfig> {
  const configFromCliOtherOptions = getConfigFromCliOtherOptions(
    cliOptions,
    cliOptionsKeyMap
  );
  return configFromCliOtherOptions;
}
