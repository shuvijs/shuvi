import {
  createSyncHook,
  createSyncBailHook,
  createAsyncParallelHook,
  createAsyncSeriesWaterfallHook,
  createHookGroup,
  isPluginInstance
} from '@shuvi/hook';
import { IncomingMessage, ServerResponse } from 'http';
import { IHtmlAttrs, IHtmlTag } from '@shuvi/platform-core';
import { IRuntimeOrServerPlugin, ICliContext } from '../api';
import { IServerMiddlewareItem, IRequest } from '../types/server';

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
  serverMiddleware,
  serverMiddlewareLast,
  serverListen,
  pageData,
  renderToHTML,
  modifyHtml,
  onViewDone,
  render
};

export type IServerPluginContext = ICliContext & {
  serverPluginRunner: PluginManager['runner'];
};

export const getManager = () =>
  createHookGroup<typeof hooksMap, IServerPluginContext>(hooksMap);

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

export const initServerModule = (
  manager: PluginManager,
  serverModule: IServerModule
) => {
  const {
    serverMiddleware,
    getPageData,
    renderToHTML,
    modifyHtml,
    onViewDone,
    render
  } = serverModule || {};
  const { usePlugin, createPlugin } = manager;
  const constructor: IServerPluginConstructor = {};
  if (serverMiddleware) constructor.serverMiddleware = () => serverMiddleware;
  if (getPageData) constructor.pageData = getPageData;
  if (renderToHTML) constructor.renderToHTML = renderToHTML;
  if (modifyHtml) constructor.modifyHtml = modifyHtml;
  if (onViewDone) constructor.onViewDone = onViewDone;
  if (render) constructor.render = render;
  usePlugin(createPlugin(constructor, { order: -100, name: 'serverModule' }));
};

const resolvePlugin = (path: string) => {
  const resolved = require(path);
  return resolved.default || resolved;
};

export const initServerPlugins = (
  manager: PluginManager,
  serverPlugins: IRuntimeOrServerPlugin[],
  pluginContext: ICliContext
): IServerPluginContext => {
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
