import { existsSync } from 'fs';
import * as path from 'path';
import logger from '@shuvi/utils/logger';
import chalk from '@shuvi/utils/chalk';
//@ts-ignore
import pkgInfo from '../package.json';

export function getPackageInfo() {
  return pkgInfo;
}

export function getProjectDir(dir: string): string {
  const dirPath = path.resolve(dir || '.');
  if (!existsSync(dirPath)) {
    logger.error(`> No such directory exists as the project root: ${dirPath}`);
    process.exit(1);
  }
  return dirPath;
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

/**
 * ref: https://github.com/remix-run/remix/blob/main/packages/remix-dev/colors.ts
 */

export const useColor =
  chalk.supportsColor &&
  // https://no-color.org/
  !process.env.NO_COLOR;

const K = <T = unknown>(x: T): T => x;

export const color = {
  heading: useColor ? chalk.underline : K,
  arg: useColor ? chalk.yellowBright : K,
  error: useColor ? chalk.red : K,
  warning: useColor ? chalk.yellow : K,
  hint: useColor ? chalk.blue : K,

  logoBlue: useColor ? chalk.blueBright : K,
  logoGreen: useColor ? chalk.greenBright : K,
  logoYellow: useColor ? chalk.yellowBright : K,
  logoPink: useColor ? chalk.magentaBright : K,
  logoRed: useColor ? chalk.redBright : K,

  gray: useColor ? chalk.gray : K,
  blue: useColor ? chalk.blue : K,
  bold: useColor ? chalk.bold : K
};
