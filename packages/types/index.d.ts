import { IFile, App, ISpecifier, ITemplateData } from '@shuvi/core';
import WebpackChain from 'webpack-chain';
import webpack from 'webpack';
import {
  Options as ProxyOptions,
  Filter as ProxyFilter
} from 'http-proxy-middleware';
import * as Runtime from './src/runtime';
import * as Bundler from './src/bundler';
import { IHookable } from './src/hookable';

export * from './src/hookable';
export * from './src/hooks';

export { webpack, WebpackChain };

export { Runtime, Bundler, IFile, ISpecifier, ITemplateData };

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
      any? /* plugin, options */,
      string? /* identifier */
    ]
  | ((api: IApi) => void);

export type IRuntimeConfig = Record<string, string>;

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
  routes?: Runtime.IRouteConfig[];
  runtimeConfig?: IRuntimeConfig;
  proxy?: IServerProxyConfig;
  plugins?: IPluginConfig[];
  analyze?: boolean;
}

// api for plugins
export interface IApi extends IHookable {
  readonly mode: IShuviMode;
  readonly paths: IPaths;
  readonly config: IApiConfig;

  addEntryCode: typeof App.prototype.addEntryCode;
  addAppFile: typeof App.prototype.addFile;
  addAppExport: typeof App.prototype.addExport;
  addAppPolyfill: typeof App.prototype.addPolyfill;
  addRuntimePlugin: typeof App.prototype.addRuntimePlugin;

  resolveAppFile(...paths: string[]): string;
  resolveUserFile(...paths: string[]): string;
  resolveBuildFile(...paths: string[]): string;
  resolvePublicFile(...paths: string[]): string;
  getAssetPublicUrl(...paths: string[]): string;
}
