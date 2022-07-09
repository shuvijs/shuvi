import { IncomingMessage, ServerResponse } from 'http';
import {
  createSyncHook,
  createAsyncParallelHook,
  createAsyncSeriesWaterfallHook
} from '@shuvi/hook';
import { IAppContext } from '@shuvi/platform-shared/src/shared';
import { IServerMiddleware } from '@shuvi/service';
import { IHtmlDocument } from './lib';

export type IHandlePageRequest = (
  req: IncomingMessage,
  res: ServerResponse
) => any;

const middlewares = createSyncHook<
  void,
  void,
  IServerMiddleware | IServerMiddleware[]
>();
const getPageData = createAsyncParallelHook<
  void,
  IAppContext,
  Record<string, unknown>
>();
const handlePageRequest = createAsyncSeriesWaterfallHook<IHandlePageRequest>();
const modifyHtml = createAsyncParallelHook<IHtmlDocument, IAppContext>();

export const extendedHooks = {
  middlewares,
  getPageData,
  handlePageRequest,
  modifyHtml
};
