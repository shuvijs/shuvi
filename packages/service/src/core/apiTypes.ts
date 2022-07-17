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
} from '../server';
import { DevMiddleware } from '../server/middlewares/dev';
import { CustomConfig } from '@shuvi/runtime';

export interface IUserRouteConfig {
  children?: IUserRouteConfig[];
  name?: string;
  component?: string;
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
  api: string;
}

export interface IMiddlewareRouteConfig {
  path: string;
  middleware: string;
}

export type IRouterHistoryMode = 'browser' | 'hash' | 'auto' | 'memory';

export type IShuviMode = 'development' | 'production';

export interface IPresetSpec {
  (options: any): {
    presets?: Config['presets'];
    plugins?: Config['plugins'];
  };
}

export interface IPreset {
  id: string;
  get: () => IPresetSpec;
}

export interface IPaths {
  // project root
  rootDir: string;

  // dir to store output files
  buildDir: string;

  // dir to store user source files
  srcDir: string;

  // dir to generate conventional routes
  routesDir: string;

  // dir to store shuvi's artifacts
  privateDir: string;

  // dir to store shuvi generated src files
  appDir: string;

  // dir to runtime libraries
  runtimeDir: string;

  // resources file
  resources: string;

  // cache file
  cacheDir: string;

  // dir to store public assets
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
  types?: string | string[];
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

export interface IRouterConfig {
  history?: IRouterHistoryMode;
}

export interface IApiConfig {
  /**
   * The byte limit of the body. This is the number of bytes or any string
   * format supported by `bytes`, for example `1000`, `'500kb'` or `'3mb'`
   * default is 1mb.
   */
  bodyParser?: { sizeLimit: number | string } | boolean;
}

export type IRuntimeConfig = Record<string, string>;

export interface Config extends CustomConfig {
  outputPath?: string;
  publicDir?: string;
  publicPath?: string;
  env?: Record<string, string>;
  router?: IRouterConfig;
  routes?: IUserRouteConfig[]; // generate by files what under src/pages or user defined
  middlewareRoutes?: IMiddlewareRouteConfig[];
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
    preBundle?: boolean;
  };
}

export interface NormalizedConfig
  extends Omit<Required<Config>, 'router' | 'apiConfig' | 'experimental'> {
  router: Required<IRouterConfig>;
  apiConfig: Required<IApiConfig>;
  experimental: {
    parcelCss: boolean;
    preBundle: boolean;
  };
}

export interface IPluginContext {
  mode: IShuviMode;
  paths: IPaths;
  config: NormalizedConfig;
  phase: IPhase;
  pluginRunner: PluginRunner;
  assetPublicPath: string;
  resolveAppFile(...paths: string[]): string;
  resolveUserFile(...paths: string[]): string;
  resolveBuildFile(...paths: string[]): string;
  resolvePublicFile(...paths: string[]): string;
  getAssetPublicUrl(...paths: string[]): string;
}
