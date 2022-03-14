import { IncomingMessage, ServerResponse } from 'http';
import {
  createAsyncParallelHook,
  createAsyncSeriesWaterfallHook
} from '@shuvi/hook';
import { IDocumentProps } from './lib';

export type IRenderToHTML = (
  req: IncomingMessage,
  res: ServerResponse
) => Promise<string | null>;

const pageData = createAsyncParallelHook<void, any, Record<string, unknown>>();
const renderToHTML = createAsyncSeriesWaterfallHook<IRenderToHTML>();
const modifyHtml = createAsyncSeriesWaterfallHook<IDocumentProps, any>();

export const extendedHooks = {
  pageData,
  renderToHTML,
  modifyHtml
};

declare module '@shuvi/service' {
  export interface ServerPluginHooks {
    pageData: typeof pageData;
    renderToHTML: typeof renderToHTML;
    modifyHtml: typeof modifyHtml;
  }
}
