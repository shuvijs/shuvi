import { IRuntimeConfig } from '@shuvi/platform-core';
import {
  ICliPluginConstructor,
  ICliPluginInstance,
  PluginRunner
} from './plugin';

export interface IUserRouteConfig {
  children?: IUserRouteConfig[];
  name?: string;
  component?: string;
  middlewares?: string[];
  redirect?: string;
  path: string;
  id?: string;
}

export interface IApiRouteConfig {
  path: string;
  apiModule: string;
}

export interface IMiddlewareRouteConfig {
  path: string;
  middlewares: string[];
}

export type IRouterHistoryMode = 'browser' | 'hash' | 'memory' | 'auto';

export type IShuviMode = 'development' | 'production';

// TODO
export type IResources<Extra = {}> = {
  [x: string]: any;
} & { [K in keyof Extra]: Extra[K] };

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

  // dir to store shuvi generated src files
  appDir: string;

  privateDir: string;

  // dir to runtime libraries
  runtimeDir: string;

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
  | ICliPluginConstructor
  | ICliPluginInstance
  | [string | ((param: any) => ICliPluginInstance), any?];
export type IPresetConfig =
  | string
  | [string /* plugin module */, any? /* plugin options */];

export declare type IPhase =
  | 'PHASE_PRODUCTION_BUILD'
  | 'PHASE_PRODUCTION_SERVER'
  | 'PHASE_DEVELOPMENT_SERVER'
  | 'PHASE_INSPECT_WEBPACK';

export type IRuntimeOrServerPlugin = {
  plugin: string;
  options?: any;
};

export interface IPlatformConfig {
  name: string;
  framework?: string;
  target?: string;
  [index: string]: any;
}

export type IPlatform = (
  config?: Omit<IPlatformConfig, 'name'>
) => Promise<ICliPluginInstance[]> | ICliPluginInstance[];

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
  /**
   * specifically target for `platform-web`
   */
  target?: 'spa' | 'ssr';
  platform?: IPlatformConfig;
  proxy?: any;
  plugins?: IPluginConfig[];
  presets?: IPresetConfig[];
  analyze?: boolean;
  asyncEntry?: boolean;
}

export interface Config
  extends Omit<Required<UserConfig>, 'router' | 'apiConfig'> {
  router: Required<IRouterConfig>;
  apiConfig: Required<IApiConfig>;
}

export type IPluginContext = {
  mode: IShuviMode;
  paths: IPaths;
  config: Config;
  phase: IPhase;
  pluginRunner: PluginRunner;
  serverPlugins: IRuntimeOrServerPlugin[];
  // resources
  assetPublicPath: string;
  resources: IResources;
  addResources: (source: string, exported: string, filepath?: string) => void;
  resolveAppFile(...paths: string[]): string;
  resolveUserFile(...paths: string[]): string;
  resolveBuildFile(...paths: string[]): string;
  resolvePublicFile(...paths: string[]): string;
  getAssetPublicUrl(...paths: string[]): string;
  getRoutes(): IUserRouteConfig[];
};
