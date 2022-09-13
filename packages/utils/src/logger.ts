import createDebug, { Debugger } from 'debug';
import chalk from 'chalk';

export interface Logger {
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

export const colorize = {
  error: (...message: any[]) => chalk.red(...message),
  warn: (...message: any[]) => chalk.yellow(...message)
};

class LoggerImpl implements Logger {
  private _debug: Debugger;

  constructor(namespace: string) {
    this._debug = createDebug(namespace);
  }

  debug(formatter: any, ...args: any[]): void {
    this._debug(formatter, ...args);
  }

  info(...args: any[]): void {
    console.log(...args);
  }

  warn(...args: any[]): void {
    console.warn(colorize.warn(...args));
  }

  error(...args: any[]): void {
    console.error(colorize.error(...args));
  }
}

const logger = new LoggerImpl('shuvi');

export function printServerUrl(url: string): void {
  const colorUrl = (url: string) =>
    chalk.cyan(url.replace(/:(\d+)\//, (_, port) => `:${chalk.bold(port)}/`));

  logger.info(
    `  ${chalk.green('➜')}  ${chalk.bold('Local')}:   ${colorUrl(url)} \n`
  );
}

export default logger;
