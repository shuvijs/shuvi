import {
  createSyncHook,
  createSyncBailHook,
  createAsyncParallelHook,
  createAsyncSeriesWaterfallHook,
  createHookGroup,
  isPluginInstance
} from '@shuvi/hook';
import WebpackChain from 'webpack-chain';
import { UserModule, TargetModule, FileOptions, fileSnippets } from './project';
import { IncomingMessage, ServerResponse } from 'http';
import { IHtmlAttrs, IHtmlTag } from '@shuvi/platform-core';
import { IRequest } from './server/http-server';
import { IUserRouteConfig, IServerMiddleware } from './server';
import {
  BundlerDoneExtra,
  BundlerTargetDoneExtra,
  ConfigWebpackAssistant,
  ExtraTargetAssistant,
  TargetChain,
  IRuntimePluginConfig,
  AppService,
  AppExport,
  BundleResource,
  OnViewDoneParams,
  IPluginContext
} from './pluginTypes';

export * from './pluginTypes';

type ArrayItem<T> = T extends Array<infer Item> ? Item : T;

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

export { isPluginInstance };

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
