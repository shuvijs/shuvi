import { IRuntimeConfig } from '@shuvi/platform-core';
import { IServerPluginInstance, PluginRunner } from './plugin';

export type IShuviServerMode = 'development' | 'production';

export enum IShuviServerPhase {
  'PHASE_INIT',
  'PHASE_BUILD',
  'PHASE_SERVE'
}

export type IRouterHistoryMode = 'browser' | 'hash' | 'memory' | 'auto';

export type INormalizedRouterHistoryMode = 'browser' | 'hash' | 'memory';

export type IResources<Extra = {}> = {
  [x: string]: any;
} & { [K in keyof Extra]: Extra[K] };

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

interface IPlatformConfig {
  name: string;
  framework?: string;
  target?: string;
  [index: string]: any;
}

export interface ShuviServerConfig {
  ssr?: boolean;
  outputPath?: string;
  publicDir?: string;
  publicPath?: string;
  env?: Record<string, string>;
  proxy?: any;
  router?: {
    history: IRouterHistoryMode;
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
  analyze?: boolean;
  asyncEntry?: boolean;
  [x: string]: any;
}

export interface NormalizedShuviServerConfig
  extends Required<ShuviServerConfig> {
  _raw: ShuviServerConfig;
}

export interface IShuviServer {
  mode: IShuviServerMode;

  init(): Promise<void>;
  listen(port: number, hostname?: string): Promise<void>;
  close(): Promise<void>;
}

export interface ShuviServerOptions {
  rootDir: string;
  config: ShuviServerConfig;
  plugins?: IServerPluginInstance[];
}

export type IPlatformPlugin = (context: any) => Promise<any[]> | any[];

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

export interface IPluginContext {
  mode: IShuviServerMode;
  phase: IShuviServerPhase;
  paths: IPaths;
  config: NormalizedShuviServerConfig;
  pluginRunner: PluginRunner;
  // resources
  assetPublicPath: string;
  resources: IResources;
  getRoutes(): IUserRouteConfig[];
}

export type IPlatform = (context: IPluginContext) => Promise<any[]> | any[];
