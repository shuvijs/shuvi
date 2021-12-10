import {
  createSyncBailHook,
  createAsyncSeriesWaterfallHook,
  createHookGroup,
  createAsyncParallelHook
} from '@shuvi/hook';
import WebpackChain from 'webpack-chain';
import webpack, { Configuration } from 'webpack';
import { IWebpackHelpers } from '@shuvi/toolpack/lib/webpack/types';
import {
  UserModule,
  TargetModule,
  FileOptions,
  fileSnippets
} from '../project';
import { IWebpackConfigOptions } from '../bundler/config';

import {
  IApiConfig,
  IUserRouteConfig,
  IShuviMode,
  ICliContext,
  IPhase,
  IRuntimeOrServerPlugin
} from '.';

type ExtraTargetAssistant = {
  createConfig(options: IWebpackConfigOptions): WebpackChain;
  mode: IShuviMode;
  webpack: typeof webpack;
};

type ConfigWebpackAssistant = {
  name: string;
  mode: IShuviMode;
  webpack: typeof webpack;
  helpers: IWebpackHelpers;
};

export interface TargetChain {
  name: string;
  chain: WebpackChain;
}
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

type AppExport = {
  source: string;
  exported: string;
};

type AppService = {
  source: string;
  exported: string;
  filepath: string;
};

type BundleResource = {
  identifier: string;
  loader: () => any;
};

const config = createAsyncSeriesWaterfallHook<IApiConfig, IPhase>();
const appRoutes = createAsyncSeriesWaterfallHook<IUserRouteConfig[]>();
const appReady = createAsyncParallelHook<void>();
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
  TargetChain
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
const setup = createAsyncParallelHook<void>();
const platformModule = createSyncBailHook<void, void, string>();
const clientModule = createSyncBailHook<void, void, TargetModule>();
const userModule = createSyncBailHook<void, void, UserModule>();
const bundleResource = createAsyncParallelHook<
  void,
  void,
  BundleResource | BundleResource[]
>();
const appPolyfill = createAsyncParallelHook<void, void, string | string[]>();
const appFile = createAsyncParallelHook<
  void,
  fileSnippets.FileSnippets,
  FileOptions | FileOptions[]
>();
const appExport = createAsyncParallelHook<
  void,
  void,
  AppExport | AppExport[]
>();
const appEntryCode = createAsyncParallelHook<void, void, string | string[]>();
const appService = createAsyncParallelHook<
  void,
  void,
  AppService | AppService[]
>();
const hooksMap = {
  config,
  appRoutes,
  appReady,
  bundlerDone,
  bundlerTargetDone,
  configWebpack,
  destroy,
  afterBuild,
  extraTarget,
  runtimePlugin,
  serverPlugin,
  setup,
  platformModule,
  clientModule,
  userModule,
  bundleResource,
  appPolyfill,
  appFile,
  appExport,
  appEntryCode,
  appService
};
export const getManager = () =>
  createHookGroup<typeof hooksMap, ICliContext>(hooksMap);

export const { createPlugin } = getManager();

export type PluginManager = ReturnType<typeof getManager>;

export type PluginRunner = PluginManager['runner'];

export type CreatePlugin = PluginManager['createPlugin'];

export type ICliPluginInstance = ArrayItem<
  Parameters<PluginManager['usePlugin']>
>;

export type ICliPluginConstructor = ArrayItem<
  Parameters<PluginManager['createPlugin']>[0]
>;

type ArrayItem<T> = T extends Array<infer Item> ? Item : T;
