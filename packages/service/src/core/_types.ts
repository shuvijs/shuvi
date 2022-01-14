import { IRuntimeConfig } from '@shuvi/platform-core';
import { ProjectBuilder } from '../project';
import {
  ICliPluginConstructor,
  ICliPluginInstance,
  PluginManager,
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

export type IShuviMode = 'development' | 'production';

export interface IPaths {
  rootDir: string;
  buildDir: string;

  // dir to store shuvi generated src files
  appDir: string;

  // user src dir
  srcDir: string;

  // functional dirs
  pagesDir: string;

  // api dirs
  apisDir: string;

  publicDir: string;
}

export interface IConfigCore {
  outputPath: string;
}

export type IRouterHistoryMode = 'browser' | 'hash' | 'memory' | 'auto';

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

interface IPlatformConfig {
  name: string;
  framework?: string;
  target?: string;
  [index: string]: any;
}

export type IPlatform = (
  context: IPluginContext
) => Promise<ICliPluginInstance[]> | ICliPluginInstance[];

export interface UserConfig {
  outputPath?: string;
  rootDir?: string;
  ssr?: boolean;
  publicDir?: string;
  publicPath?: string;
  env?: Record<string, string>;
  router?: {
    history?: IRouterHistoryMode;
  };
  routes?: IUserRouteConfig[]; // generate by files what under src/pages or user defined
  apiRoutes?: IApiRouteConfig[]; // generate by files what under src/apis or user defined
  apiConfig?: {
    prefix?: string;
    /**
     * The byte limit of the body. This is the number of bytes or any string
     * format supported by `bytes`, for example `1000`, `'500kb'` or `'3mb'`
     * default is 1mb.
     */
    bodyParser?: { sizeLimit: number | string } | boolean;
  };
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

export type Config = Required<UserConfig>;

export type IRuntimeOrServerPlugin = {
  plugin: string;
  options?: any;
};

// api for plugins
export interface IApi {
  readonly mode: IShuviMode;
  readonly paths: IPaths;
  readonly config: UserConfig;
  readonly phase: IPhase;
  pluginManager: PluginManager;

  // precursor shuvi app
  addEntryCode: typeof ProjectBuilder.prototype.addEntryCode;
  addAppFile: typeof ProjectBuilder.prototype.addFile;
  addRuntimeService: typeof ProjectBuilder.prototype.addRuntimeService;
  addResources: typeof ProjectBuilder.prototype.addResources;
  addAppPolyfill: typeof ProjectBuilder.prototype.addPolyfill;

  setPlatformModule: typeof ProjectBuilder.prototype.setPlatformModule;
  setClientModule: typeof ProjectBuilder.prototype.setClientModule;

  addRuntimePlugin: (config: IRuntimeOrServerPlugin) => void;
  addServerPlugin: (config: IRuntimeOrServerPlugin) => void;

  resolveAppFile(...paths: string[]): string;
  resolveUserFile(...paths: string[]): string;
  resolveBuildFile(...paths: string[]): string;
  resolvePublicFile(...paths: string[]): string;
  getAssetPublicUrl(...paths: string[]): string;
}

export type IResources<Extra = {}> = {
  [x: string]: any;
} & { [K in keyof Extra]: Extra[K] };

export interface IPresetSpec {
  (context: IPluginContext): {
    presets?: UserConfig['presets'];
    plugins?: UserConfig['plugins'];
  };
}

export interface IPreset {
  id: string;
  get: () => IPresetSpec;
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
  resolveAppFile(...paths: string[]): string;
  resolveUserFile(...paths: string[]): string;
  resolveBuildFile(...paths: string[]): string;
  resolvePublicFile(...paths: string[]): string;
  getAssetPublicUrl(...paths: string[]): string;
  getRoutes(): IUserRouteConfig[];
};
