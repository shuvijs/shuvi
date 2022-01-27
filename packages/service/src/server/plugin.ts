import {
  createSyncHook,
  createSyncBailHook,
  createAsyncParallelHook,
  createAsyncSeriesWaterfallHook,
  createHookManager,
  isPluginInstance
} from '@shuvi/hook';
import { IRuntimeOrServerPlugin, IPluginContext } from '../core';
import {
  IServerAppContext,
  IServerMiddleware,
  IRenderToHTML,
  IDocumentProps,
  OnViewDoneParams
} from './pluginTypes';
import { DevMiddleware } from '../lib/devMiddleware';

// @ts-ignore
import { server } from '../resources';

export * from './pluginTypes';

type ArrayItem<T> = T extends Array<infer Item> ? Item : T;

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

export type IServerPluginContext = IPluginContext & {
  serverPluginRunner: PluginManager['runner'];
};

export type PluginManager = ReturnType<typeof getManager>;

export type PluginRunner = PluginManager['runner'];

export type CreatePlugin = PluginManager['createPlugin'];

export type IServerPluginInstance = ArrayItem<
  Parameters<PluginManager['usePlugin']>
>;

export type IServerPluginConstructor = ArrayItem<
  Parameters<PluginManager['createPlugin']>[0]
>;
const serverMiddlewareBeforeDevMiddleware = createAsyncParallelHook<
  void,
  DevMiddleware,
  IServerMiddleware | IServerMiddleware[]
>();

const serverMiddleware = createAsyncParallelHook<
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

const hooksMap = {
  serverMiddlewareBeforeDevMiddleware,
  serverMiddleware,
  serverListen,
  pageData,
  renderToHTML,
  modifyHtml,
  onViewDone,
  render
};

export const getManager = () =>
  createHookManager<typeof hooksMap, IServerPluginContext>(hooksMap);

export const { createPlugin: createServerPlugin } = getManager();

const resolvePlugin = (path: string) => {
  const resolved = require(path);
  return resolved.default || resolved;
};

export const initServerPlugins = (
  manager: PluginManager,
  serverPlugins: IRuntimeOrServerPlugin[],
  pluginContext: IPluginContext
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
        return server?.server?.serverMiddleware || [];
      },
      pageData: (appContext, context) => {
        return server?.server?.getPageData?.(appContext, context) || {};
      },
      renderToHTML: (renderToHTML, context) => {
        return server?.server?.renderToHTML?.(renderToHTML) || renderToHTML;
      },
      modifyHtml: (documentProps, appContext, context) => {
        return (
          server?.server?.modifyHtml?.(documentProps, appContext) ||
          documentProps
        );
      },
      onViewDone: (params, context) => {
        server?.server?.onViewDone?.(params);
      },
      render: (renderAppToString, appContext, context) => {
        return server?.server?.render?.(renderAppToString, appContext);
      }
    },
    { order: -100, name: 'serverModule' }
  );
  manager.usePlugin(serverModulePlugin);
  return serverContext;
};
