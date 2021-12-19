import {
  createSyncHook,
  createSyncBailHook,
  createAsyncParallelHook,
  createAsyncSeriesWaterfallHook,
  createHookGroup
} from '@shuvi/hook';
import WebpackChain from 'webpack-chain';
import webpack, { Configuration } from 'webpack';
import { IWebpackHelpers } from '@shuvi/toolpack/lib/webpack/types';
import { UserModule, TargetModule, FileOptions, fileSnippets } from './project';
import { IWebpackConfigOptions } from './bundler/config';
import { IncomingMessage, ServerResponse } from 'http';
import { IHtmlAttrs, IHtmlTag } from '@shuvi/platform-core';
import { IRequest } from './server/http-server';
import {
  IShuviServerMode,
  IUserRouteConfig,
  IServerMiddleware,
  IShuviServerPhase,
  IPaths,
  NormalizedShuviServerConfig,
  IResources
} from './server';

type ArrayItem<T> = T extends Array<infer Item> ? Item : T;

export type ExtraTargetAssistant = {
  createConfig(options: IWebpackConfigOptions): WebpackChain;
  mode: IShuviServerMode;
  webpack: typeof webpack;
};

export type ConfigWebpackAssistant = {
  name: string;
  mode: IShuviServerMode;
  webpack: typeof webpack;
  helpers: IWebpackHelpers;
};

export type IRuntimePluginConfig = {
  plugin: string;
  options?: any;
};

export interface TargetChain {
  name: string;
  chain: WebpackChain;
}
export interface Target {
  name: string;
  config: Configuration;
}

export type BundlerDoneExtra = {
  first: boolean;
  stats: webpack.MultiStats;
};

export type BundlerTargetDoneExtra = {
  first: boolean;
  name: string;
  stats: webpack.Stats;
};

export type AppExport = {
  source: string;
  exported: string;
};

export type AppService = {
  source: string;
  exported: string;
  filepath: string;
};

export type BundleResource = {
  identifier: string;
  loader: () => any;
};

export interface IDocumentProps {
  htmlAttrs: IHtmlAttrs;
  headTags: IHtmlTag<
    'meta' | 'link' | 'style' | 'script' | 'noscript' | 'title'
  >[];
  mainTags: IHtmlTag[];
  scriptTags: IHtmlTag<'script'>[];
}

export type IRenderToHTML = (
  req: IncomingMessage,
  res: ServerResponse
) => Promise<string | null>;

export interface IServerAppContext {
  req: IRequest;
  [x: string]: any;
}

export interface IServerModule {
  serverMiddleware?: IServerMiddleware | IServerMiddleware[];
  getPageData?: IServerPluginConstructor['pageData'];
  renderToHTML?: IServerPluginConstructor['renderToHTML'];
  modifyHtml?: IServerPluginConstructor['modifyHtml'];
  onViewDone?: IServerPluginConstructor['onViewDone'];
  render?: (
    renderAppToString: () => string,
    appContext: IServerAppContext
  ) => string | void | undefined;
}

export type OnViewDoneParams = {
  req: IncomingMessage;
  res: ServerResponse;
  html: string | null;
  appContext: any;
};

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
  string | string[] | IRuntimePluginConfig | IRuntimePluginConfig[]
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

const serverMiddleware = createAsyncParallelHook<
  void,
  void,
  IServerMiddleware | IServerMiddleware[]
>();
const serverMiddlewareLast = createAsyncParallelHook<
  void,
  void,
  IServerMiddleware | IServerMiddleware[]
>();

const serverListen =
  createAsyncParallelHook<{ port: number; hostname?: string }>();

const pageData = createAsyncParallelHook<void, any, Record<string, unknown>>();

const renderToHTML = createAsyncSeriesWaterfallHook<IRenderToHTML>();

const modifyHtml = createAsyncSeriesWaterfallHook<IDocumentProps, any>();

const onViewDone = createSyncHook<OnViewDoneParams, void, void>();

const render = createSyncBailHook<() => string, IServerAppContext, string>();

export const hooksMap = {
  appRoutes,
  appReady,
  bundlerDone,
  bundlerTargetDone,
  configWebpack,
  destroy,
  afterBuild,
  extraTarget,
  runtimePlugin,
  setup,
  platformModule,
  clientModule,
  userModule,
  bundleResource,
  appPolyfill,
  appFile,
  appExport,
  appEntryCode,
  appService, // todo: remote

  serverMiddleware,
  serverMiddlewareLast,
  serverListen,
  pageData,
  renderToHTML,
  modifyHtml,
  onViewDone,
  render
};

export const getManager = () =>
  createHookGroup<typeof hooksMap, IPluginContext>(hooksMap);

export const { createPlugin } = getManager();

export type PluginManager = ReturnType<typeof getManager>;

export type PluginRunner = PluginManager['runner'];

export type CreatePlugin = PluginManager['createPlugin'];

export type IServerPluginInstance = ArrayItem<
  Parameters<PluginManager['usePlugin']>
>;

export type IServerPluginConstructor = ArrayItem<
  Parameters<PluginManager['createPlugin']>[0]
>;

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
