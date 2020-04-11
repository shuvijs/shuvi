import { IFile, App, ISpecifier, ITemplateData } from '@shuvi/core';
import WebpackChain from 'webpack-chain';
import webpack from 'webpack';
import {
  Options as ProxyOptions,
  Filter as ProxyFilter,
} from 'http-proxy-middleware';
import * as Runtime from './src/runtime';
import * as Bundler from './src/bundler';
import { IHookConfig } from './src/hooks';

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

export interface IConfig {
  outputPath: string;
  rootDir: string;
  ssr: boolean;
  publicPath: string;
  env: Record<string, string>;
  router: {
    history: IRouterHistoryMode;
  };
  runtimeConfig?: IRuntimeConfig | (() => IRuntimeConfig);
  proxy?: IServerProxyConfig;
  plugins?: IPluginConfig[];
}

export interface IHookOpts<InitValue = void, Args extends any[] = any[]> {
  name: string;
  fn: InitValue extends void
    ? (...args: Args) => void | Promise<void>
    : (init: InitValue, ...args: Args) => InitValue | Promise<InitValue>;
  before?: string;
  stage?: number;
}

export interface ICallHookOpts<Name extends string = string, InitV = unknown> {
  name: Name;
  bail?: boolean;
  parallel?: boolean;
  initialValue?: InitV;
}

// api for plugins
export interface IApi {
  mode: IShuviMode;
  paths: IPaths;
  config: IConfig;
  assetPublicPath: string;

  tap<Config extends IHookConfig>(
    hook: Config['name'],
    opts: IHookOpts<Config['initialValue'], Config['args']>
  ): void;
  callHook<Config extends IHookConfig>(
    name: Config['name'],
    ...args: Config['args']
  ): Promise<void>;
  callHook<Config extends IHookConfig>(
    options: ICallHookOpts<Config['name'], Config['initialValue']>,
    ...args: Config['args']
  ): Promise<Config['initialValue']>;

  on<Config extends IHookConfig>(
    hook: Config['name'],
    listener: (...args: Config['args']) => void
  ): void;
  emitEvent<Config extends IHookConfig>(
    name: Config['name'],
    ...args: Config['args']
  ): void;

  addAppFile: typeof App.prototype.addFile;
  addAppExport: typeof App.prototype.addExport;
  addAppPolyfill: typeof App.prototype.addPolyfill;

  resolveAppFile(...paths: string[]): string;
  resolveUserFile(...paths: string[]): string;
  resolveBuildFile(...paths: string[]): string;
  resolvePublicFile(...paths: string[]): string;
  getAssetPublicUrl(...paths: string[]): string;

  destory(): Promise<void>;
}
