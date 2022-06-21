import {
  CorePluginConstructor,
  CorePluginInstance,
  PluginRunner
} from './lifecycle';

import { FileOptions } from '../project';
import {
  IServerMiddleware,
  IServerPluginContext,
  ServerPluginInstance
} from '..';
import { DevMiddleware } from '../server/middlewares/dev';

export interface IUserRouteConfig {
  children?: IUserRouteConfig[];
  name?: string;
  component?: string;
  middlewares?: string[];
  redirect?: string;
  path: string;
  fullPath?: string;
}

export interface IRouteConfig extends IUserRouteConfig {
  id: string;
  children?: IRouteConfig[];
}

export interface IApiRouteConfig {
  path: string;
  apiModule: string;
}

export interface IMiddlewareRouteConfig {
  path: string;
  middlewares: string[];
}

export type IRouterHistoryMode = 'browser' | 'hash' | 'auto' | 'memory';

export type IShuviMode = 'development' | 'production';

export interface IPresetSpec {
  (options: any): {
    presets?: UserConfig['presets'];
    plugins?: UserConfig['plugins'];
  };
}

export interface IPreset {
  id: string;
  get: () => IPresetSpec;
}

export interface IPaths {
  rootDir: string;
  buildDir: string;

  // dir to store shuvi's artifacts
  privateDir: string;

  // dir to store shuvi generated src files
  appDir: string;

  // dir to runtime libraries
  runtimeDir: string;

  //resources file
  resources: string;

  // user src dir
  srcDir: string;

  // functional dirs
  pagesDir: string;

  // api dirs
  apisDir: string;

  publicDir: string;
}

export type IPluginConfig =
  | string
  | CorePluginConstructor
  | CorePluginInstance
  | [string, any?];
export type IPresetConfig =
  | string
  | [string /* plugin module */, any? /* plugin options */];

export declare type IPhase =
  | 'PHASE_PRODUCTION_BUILD'
  | 'PHASE_PRODUCTION_SERVER'
  | 'PHASE_DEVELOPMENT_SERVER'
  | 'PHASE_INSPECT_WEBPACK';

export type RuntimePluginConfig = {
  plugin: string;
  options?: any;
};

export interface ResolvedPlugin {
  core?: CorePluginInstance; // instance
  server?: ServerPluginInstance; // instance
  runtime?: RuntimePluginConfig;
  types?: string;
}

export interface IPlatformConfig {
  name: string;
  framework?: string;
  target?: string;
  [index: string]: any;
}

export type IPlatformContent = {
  plugins?: (CorePluginInstance | ResolvedPlugin | string)[];
  getPresetRuntimeFiles: (
    context: IPluginContext
  ) => FileOptions[] | Promise<FileOptions[]>;
  getMiddlewares?: (
    context: IServerPluginContext
  ) => IServerMiddleware | IServerMiddleware[];
  getMiddlewaresBeforeDevMiddlewares?: (
    devMiddleware: DevMiddleware,
    context: IServerPluginContext
  ) => IServerMiddleware | IServerMiddleware[];
};

export type IPlatformContext = {
  serverPlugins: ServerPluginInstance[];
};

export type IPlatform = (
  config: Omit<IPlatformConfig, 'name'>,
  context: IPlatformContext
) => Promise<IPlatformContent> | IPlatformContent;

// TODO: remove this, should be extend by platform
export type ILoaderOptions = {
  sequential?: boolean;
};

export interface IRouterConfig {
  history?: IRouterHistoryMode;
}

export interface IApiConfig {
  prefix?: string;
  /**
   * The byte limit of the body. This is the number of bytes or any string
   * format supported by `bytes`, for example `1000`, `'500kb'` or `'3mb'`
   * default is 1mb.
   */
  bodyParser?: { sizeLimit: number | string } | boolean;
}

export type IRuntimeConfig = Record<string, string>;

export interface UserConfig {
  outputPath?: string;
  ssr?: boolean;
  publicDir?: string;
  publicPath?: string;
  env?: Record<string, string>;
  router?: IRouterConfig;
  routes?: IUserRouteConfig[]; // generate by files what under src/pages or user defined
  apiRoutes?: IApiRouteConfig[]; // generate by files what under src/apis or user defined
  apiConfig?: IApiConfig;
  runtimeConfig?: IRuntimeConfig;
  publicRuntimeConfig?: IRuntimeConfig;
  typescript?: { ignoreBuildErrors?: boolean };
  /**
   * specifically target for `platform-web`
   */
  target?: 'spa' | 'ssr';
  platform?: IPlatformConfig;
  proxy?: any;
  plugins?: IPluginConfig[];
  presets?: IPresetConfig[];
  analyze?: boolean;
  experimental?: {
    parcelCss?: boolean;
    loader?: ILoaderOptions;
  };
}

export interface Config
  extends Omit<Required<UserConfig>, 'router' | 'apiConfig' | 'experimental'> {
  router: Required<IRouterConfig>;
  apiConfig: Required<IApiConfig>;
  experimental: {
    parcelCss: boolean;
    loader: ILoaderOptions;
  };
}

export type IPluginContext = {
  mode: IShuviMode;
  paths: IPaths;
  config: Config;
  phase: IPhase;
  pluginRunner: PluginRunner;
  assetPublicPath: string;
  resolveAppFile(...paths: string[]): string;
  resolveUserFile(...paths: string[]): string;
  resolveBuildFile(...paths: string[]): string;
  resolvePublicFile(...paths: string[]): string;
  getAssetPublicUrl(...paths: string[]): string;
};
