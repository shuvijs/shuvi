import {
  IFile,
  App,
  ISpecifier,
  ITemplateData,
  IHookable,
  AppHooks
} from '@shuvi/core';
import WebpackChain from 'webpack-chain';
import webpack from 'webpack';
import {
  Options as ProxyOptions,
  Filter as ProxyFilter
} from 'http-proxy-middleware';
import * as Runtime from './src/runtime';
import * as Bundler from './src/bundler';
import * as APIHooks from './src/hooks';

export { webpack, WebpackChain };

export {
  Runtime,
  Bundler,
  APIHooks,
  AppHooks,
  IFile,
  ISpecifier,
  ITemplateData
};

export interface IServerProxyConfigItem extends ProxyOptions {
  context?: ProxyFilter;
}

export type IServerProxyConfig =
  | Record<string, string | Omit<IServerProxyConfigItem, 'context'>>
  | IServerProxyConfigItem[];

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

  publicDir: string;
}

export interface IConfigCore {
  outputPath: string;
}

export type IRouterHistoryMode = 'browser' | 'hash' | 'auto';

export type IPluginConfig =
  | string
  | [
      string /* plugin module */,
      any? /* plugin options */,
      string? /* identifier */
    ]
  | ((api: IApi) => void);

export type IPresetConfig =
  | string
  | [string /* plugin module */, any? /* plugin options */];

export type IRuntimeConfig = Record<string, string>;

export declare type IPhase =
  | 'PHASE_PRODUCTION_BUILD'
  | 'PHASE_PRODUCTION_SERVER'
  | 'PHASE_DEVELOPMENT_SERVER'
  | 'PHASE_INSPECT_WEBPACK';

export type IServerMiddlewareOption = { order?: number };

export interface IApiConfig {
  outputPath: string;
  rootDir: string;
  ssr: boolean;
  publicDir: string;
  publicPath: string;
  env: Record<string, string>;
  router: {
    history: IRouterHistoryMode;
  };
  routes?: Runtime.IUserRouteConfig[];
  runtimeConfig?: IRuntimeConfig;
  proxy?: IServerProxyConfig;
  plugins?: IPluginConfig[];
  presets?: IPresetConfig[];
  analyze?: boolean;
}

// api for plugins
export interface IApi extends IHookable {
  readonly mode: IShuviMode;
  readonly paths: IPaths;
  readonly config: IApiConfig;
  readonly phase: IPhase;

  addEntryCode: typeof App.prototype.addEntryCode;
  addAppFile: typeof App.prototype.addFile;
  addAppExport: typeof App.prototype.addExport;
  addAppPolyfill: typeof App.prototype.addPolyfill;
  addRuntimePlugin: typeof App.prototype.addRuntimePlugin;
  addServerMiddleware: (
    serverMiddleware: Runtime.IServerMiddleware,
    options?: IServerMiddlewareOption
  ) => void;

  resolveAppFile(...paths: string[]): string;
  resolveUserFile(...paths: string[]): string;
  resolveBuildFile(...paths: string[]): string;
  resolvePublicFile(...paths: string[]): string;
  getAssetPublicUrl(...paths: string[]): string;
}
