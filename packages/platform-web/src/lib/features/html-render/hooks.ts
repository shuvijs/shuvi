import { IncomingMessage, ServerResponse } from 'http';
import {
  createSyncHook,
  createAsyncParallelHook,
  createAsyncSeriesWaterfallHook
} from '@shuvi/hook';
import { IAppContext } from '@shuvi/platform-shared/lib/runtime';
import { IServerMiddleware } from '@shuvi/service';
import { IHtmlDocument } from './lib';

export type IHandlePageRequest = (
  req: IncomingMessage,
  res: ServerResponse
) => any;

const pageData = createAsyncParallelHook<
  void,
  IAppContext,
  Record<string, unknown>
>();
const handlePageRequest = createAsyncSeriesWaterfallHook<IHandlePageRequest>();
const modifyHtml = createAsyncSeriesWaterfallHook<IHtmlDocument, IAppContext>();
const addMiddleware = createSyncHook<
  void,
  void,
  IServerMiddleware | IServerMiddleware[]
>();

export const extendedHooks = {
  pageData,
  handlePageRequest,
  modifyHtml,
  addMiddleware
};
