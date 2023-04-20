import { Option, InvalidArgumentError, Argument } from 'commander';
import { IServiceMode } from '@shuvi/service';

export const argumentDir = new Argument('[dir]', 'specify dir').default('.');

export const optionNoColor = new Option(
  '--no-color',
  `Disable ANSI colors in console output`
).default(false);

export const optionHostDev = new Option(
  '--host <host>',
  'specify host'
).default('localhost');

export const optionHostServe = new Option(
  '--host <host>',
  'specify host'
).default('0.0.0.0');

export const optionPort = new Option('--port <port>', 'specify port')
  .argParser(port => Number(port))
  .default(3000);

export const optionConfig = new Option(
  '--config <file>',
  'path to config file'
).default(null);

export const optionOverrides = new Option(
  '--config-overrides <json>',
  'config overrides json'
).hideHelp(true);

export const optionAnalyze = new Option(
  '--analyze',
  'generate html report files and stats json files to help analyze webpack bundle'
);

export const optionPublicPath = new Option(
  '--public-path <url>',
  'specify the asset prefix. eg: https://some.cdn.com'
);

export const optionTarget = new Option(
  '--target <target>',
  'specify the app output target. eg: spa'
);

export const optionRouterHistory = new Option(
  '--router-history <history>',
  "specify the hisotry type. 'browser' or 'hash'"
);

const validModes = ['development', 'production'];
export const optionMode = new Option('--mode <mode>', 'specify env mode.')
  .default('development')
  .choices(validModes)
  .argParser(function (value: string) {
    if (!validModes.includes(value)) {
      throw new InvalidArgumentError(`Invalid argument: --mode ${value}`);
    }
    return value;
  });

export const optionVerbose = new Option(
  '--verbose',
  'show full webpack config'
);

export interface Options {
  config?: string;
  /**
   * string of JSON format to replace the config for E2E testing
   * @internal
   */
  configOverrides?: string;
}

export interface DevOptions extends Options {
  host: string;
  port: number;
}

export interface BuildOptions extends Options {
  analyze?: boolean;
  publicPath?: string;
  target?: string;
  routerHistory?: string;
}

export interface InspectOptions extends Options {
  mode?: IServiceMode;
  verbose?: boolean;
}

export interface ServeOptions extends Options {
  host: string;
  port: number;
}

export interface LintOptions extends Options {
  mode?: IServiceMode;
}
