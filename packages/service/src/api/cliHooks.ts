import {
  createAsyncSeriesWaterfallHook,
  createHookGroup,
  createAsyncParallelHook
} from '@shuvi/hook';
import WebpackChain from 'webpack-chain';
import webpack, { Configuration } from 'webpack';
import { IWebpackHelpers } from '@shuvi/toolpack/lib/webpack/types';

import {
  IApiConfig,
  IUserRouteConfig,
  IShuviMode,
  IPluginContext,
  IPhase,
  IRuntimeOrServerPlugin,
  Api
} from '.';

type ExtraTargetAssistant = {
  createConfig(options: any): any;
  mode: IShuviMode;
  webpack: typeof webpack;
};

type ConfigWebpackAssistant = {
  name: string;
  mode: IShuviMode;
  webpack: typeof webpack;
  helpers: IWebpackHelpers;
};

export interface Target {
  name: string;
  config: Configuration;
}

type BundlerDoneExtra = {
  first: boolean;
  stats: webpack.MultiStats;
};

type BundlerTargetDoneExtra = {
  first: boolean;
  name: string;
  stats: webpack.Stats;
};

const config = createAsyncSeriesWaterfallHook<IApiConfig, IPhase>();
const appRoutes = createAsyncSeriesWaterfallHook<IUserRouteConfig[]>();
const appReady = createAsyncParallelHook<void>();
const serverListen =
  createAsyncParallelHook<{ port: number; hostname: string }>();
const bundlerDone = createAsyncParallelHook<BundlerDoneExtra>();
const bundlerTargetDone = createAsyncParallelHook<BundlerTargetDoneExtra>();
const configWebpack = createAsyncSeriesWaterfallHook<
  WebpackChain,
  ConfigWebpackAssistant
>();
const destroy = createAsyncParallelHook<void>();
const afterBuild = createAsyncParallelHook<void>();
const extraTarget = createAsyncParallelHook<
  ExtraTargetAssistant,
  void,
  Target
>();
const runtimePlugin = createAsyncParallelHook<
  void,
  void,
  string | string[] | IRuntimeOrServerPlugin | IRuntimeOrServerPlugin[]
>();
const serverPlugin = createAsyncParallelHook<
  void,
  void,
  string | string[] | IRuntimeOrServerPlugin | IRuntimeOrServerPlugin[]
>();
const legacyApi = createAsyncParallelHook<Api>();
const hooksMap = {
  config,
  appRoutes,
  appReady,
  serverListen,
  bundlerDone,
  bundlerTargetDone,
  configWebpack,
  destroy,
  afterBuild,
  extraTarget,
  runtimePlugin,
  serverPlugin,
  legacyApi
};
export const manager = createHookGroup<typeof hooksMap, IPluginContext>(
  hooksMap
);

export const { createPlugin, runner, usePlugin, setContext, clear } = manager;

export type ICliPluginInstance = ArrayItem<Parameters<typeof usePlugin>>;

export type ICliPluginConstructor = ArrayItem<
  Parameters<typeof createPlugin>[0]
>;

type ArrayItem<T> = T extends Array<infer Item> ? Item : T;

export const initPlugins = (plugin?: ICliPluginInstance) => {
  // manager.clear();
  plugin && manager.usePlugin(plugin);
};
