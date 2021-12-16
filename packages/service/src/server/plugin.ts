import {
  createSyncHook,
  createSyncBailHook,
  createAsyncParallelHook,
  createAsyncSeriesWaterfallHook,
  createHookGroup,
  isPluginInstance
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
import { IncomingMessage, ServerResponse } from 'http';
import { IHtmlAttrs, IHtmlTag } from '@shuvi/platform-core';
import { IServerMiddlewareItem, IRequest } from './http-server';
import {
  IShuviServerMode,
  IUserRouteConfig,
  IPluginContext
} from './shuviServerTypes';

type ExtraTargetAssistant = {
  createConfig(options: IWebpackConfigOptions): WebpackChain;
  mode: IShuviServerMode;
  webpack: typeof webpack;
};

type ConfigWebpackAssistant = {
  name: string;
  mode: IShuviServerMode;
  webpack: typeof webpack;
  helpers: IWebpackHelpers;
};

type IRuntimePluginConfig = {
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

type OnViewDoneParams = {
  req: IncomingMessage;
  res: ServerResponse;
  html: string | null;
  appContext: any;
};

type IServerMiddleware =
  | IServerMiddlewareItem
  | IServerMiddlewareItem['handler'];

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

type ArrayItem<T> = T extends Array<infer Item> ? Item : T;

const resolvePlugin = (path: string) => {
  const resolved = require(path);
  return resolved.default || resolved;
};

export const initServerPlugins = (
  manager: PluginManager,
  serverPlugins: IRuntimePluginConfig[],
  pluginContext: IPluginContext
): IPluginContext => {
  const serverContext = Object.assign(
    { serverPluginRunner: manager.runner },
    pluginContext
  );
  manager.setContext(serverContext);
  serverPlugins.forEach(({ plugin, options }) => {
    const resolved = resolvePlugin(plugin);
    let pluginInstance: IServerPluginInstance | undefined;
    if (isPluginInstance(resolved)) {
      pluginInstance = resolved;
    } else if (typeof resolved === 'function') {
      const pluginByOptions = resolved(options || {});
      if (isPluginInstance(pluginByOptions)) {
        pluginInstance = pluginByOptions;
      }
    }
    if (pluginInstance) {
      manager.usePlugin(pluginInstance);
    } else {
      throw new Error(`serverPlugin load failed. path: ${plugin}`);
    }
  });
  const serverModulePlugin = manager.createPlugin(
    {
      serverMiddleware: context => {
        return context.resources?.server?.server?.serverMiddleware || [];
      },
      pageData: (appContext, context) => {
        return (
          context.resources?.server?.server?.getPageData?.(
            appContext,
            context
          ) || {}
        );
      },
      renderToHTML: (renderToHTML, context) => {
        return (
          context.resources?.server?.server?.renderToHTML?.(renderToHTML) ||
          renderToHTML
        );
      },
      modifyHtml: (documentProps, appContext, context) => {
        return (
          context.resources?.server?.server?.modifyHtml?.(
            documentProps,
            appContext
          ) || documentProps
        );
      },
      onViewDone: (params, context) => {
        context.resources?.server?.server?.onViewDone?.(params);
      },
      render: (renderAppToString, appContext, context) => {
        return context.resources?.server?.server?.render?.(
          renderAppToString,
          appContext
        );
      }
    },
    { order: -100, name: 'serverModule' }
  );
  manager.usePlugin(serverModulePlugin);
  return serverContext;
};
