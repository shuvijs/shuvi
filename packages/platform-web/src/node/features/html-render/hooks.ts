import { IncomingMessage, ServerResponse } from 'http';
import {
  createSyncHook,
  createSyncWaterfallHook,
  createAsyncParallelHook
} from '@shuvi/hook';
import { IAppContext } from '@shuvi/platform-shared/shared';
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
const handlePageRequest = createSyncWaterfallHook<IHandlePageRequest>();
// todo: change to AsyncSeries
const modifyHtml = createAsyncParallelHook<IHtmlDocument, IAppContext>();

export const extendedHooks = {
  middlewares,
  getPageData,
  handlePageRequest,
  modifyHtml
};
