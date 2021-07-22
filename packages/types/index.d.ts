import { ITemplateData, IHookable, AppHooks } from '@shuvi/core';
import WebpackChain from 'webpack-chain';
import webpack from 'webpack';
import * as Runtime from './src/runtime';
import * as Bundler from './src/bundler';
import * as APIHooks from './src/hooks';

export { webpack, WebpackChain };

export { Runtime, Bundler, APIHooks, AppHooks, ITemplateData };

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

export type IRouterHistoryMode = 'browser' | 'hash' | 'memory' | 'auto';

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
  platform?: string;
  proxy?: any;
  plugins?: IPluginConfig[];
  presets?: IPresetConfig[];
  analyze?: boolean;
  asyncEntry?: boolean;
}

// api for plugins
export interface IApi extends IHookable {
  readonly mode: IShuviMode;
  readonly paths: IPaths;
  readonly config: IApiConfig;
  readonly phase: IPhase;
  readonly clientManifest: Bundler.IManifest;
  addEntryCode: any;
  addAppFile: any;
  addAppService: any;
  addAppPolyfill: any;
  addRuntimePlugin: any;
  resolveAppFile(...paths: string[]): string;
  resolveUserFile(...paths: string[]): string;
  resolveBuildFile(...paths: string[]): string;
  resolvePublicFile(...paths: string[]): string;
  getAssetPublicUrl(...paths: string[]): string;
}
