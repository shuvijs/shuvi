import { IncomingMessage, ServerResponse } from 'http';
import {
  createSyncHook,
  createAsyncParallelHook,
  createAsyncSeriesWaterfallHook
} from '@shuvi/hook';
import { IServerMiddleware } from '@shuvi/service';
import { IDocumentProps } from './lib';

export type IRenderToHTML = (
  req: IncomingMessage,
  res: ServerResponse
) => Promise<string | null>;

const pageData = createAsyncParallelHook<void, any, Record<string, unknown>>();
const renderToHTML = createAsyncSeriesWaterfallHook<IRenderToHTML>();
const modifyHtml = createAsyncSeriesWaterfallHook<IDocumentProps, any>();
const addMiddleware = createSyncHook<
  void,
  void,
  IServerMiddleware | IServerMiddleware[]
>();
export const extendedHooks = {
  pageData,
  renderToHTML,
  modifyHtml,
  addMiddleware
};

declare module '@shuvi/service' {
  export interface ServerPluginHooks {
    pageData: typeof pageData;
    renderToHTML: typeof renderToHTML;
    modifyHtml: typeof modifyHtml;
    addMiddleware: typeof addMiddleware;
  }
}
