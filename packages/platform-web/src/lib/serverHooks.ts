import {
  createAsyncSeriesWaterfallHook,
  createAsyncParallelHook,
  createHookGroup,
  isPluginInstance
} from '@shuvi/hook';

import { IRuntimeOrServerPlugin, IPluginContext } from '@shuvi/service/lib/api';
import { IRenderToHTML, IDocumentProps, IServerModule } from './types';
const pageData = createAsyncParallelHook<void, any, Record<string, unknown>>();
const renderToHTML = createAsyncSeriesWaterfallHook<IRenderToHTML>();
const modifyHtml = createAsyncSeriesWaterfallHook<IDocumentProps, any>();
export const hooksMap = {
  pageData,
  renderToHTML,
  modifyHtml
};

export const manager = createHookGroup<typeof hooksMap, IPluginContext>(
  hooksMap
);

export const { createPlugin, usePlugin, runner, setContext } = manager;
export type IServerPluginConstructor = ArrayItem<
  Parameters<typeof createPlugin>[0]
>;
export type IServerPluginInstance = ArrayItem<
  Parameters<typeof manager['usePlugin']>
>;

type ArrayItem<T> = T extends Array<infer Item> ? Item : T;

export const initServerModule = (serverModule: IServerModule) => {
  const { render, onViewDone, ...hooks } = serverModule;
  usePlugin(createPlugin(hooks));
};

const resolvePlugin = (path: string) => {
  const resolved = require(path);
  return resolved.default || resolved;
};

export const initServerPlugins = (
  serverPlugins: IRuntimeOrServerPlugin[],
  pluginContext: IPluginContext
) => {
  setContext(pluginContext);
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
      usePlugin(pluginInstance);
    } else {
      throw new Error(`serverPlugin load failed. path: ${plugin}`);
    }
  });
};
