import { existsSync } from 'fs';
import * as path from 'path';
import { CommanderStatic } from 'commander';
import logger from '@shuvi/utils/lib/logger';
import chalk from '@shuvi/utils/lib/chalk';
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
