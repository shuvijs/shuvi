import { IncomingMessage, ServerResponse } from 'http';
import { createSyncWaterfallHook, createAsyncParallelHook } from '@shuvi/hook';
import { IAppContext } from '@shuvi/platform-shared/shared';
import { IHtmlDocument } from '../html-render';

export type IHandlePageRequest = (
  req: IncomingMessage,
  res: ServerResponse
) => any;

const getPageData = createAsyncParallelHook<
  void,
  IAppContext,
  Record<string, unknown>
>();
const handlePageRequest = createSyncWaterfallHook<IHandlePageRequest>();
// todo: change to AsyncSeries
const modifyHtml = createAsyncParallelHook<IHtmlDocument, IAppContext>();

export const extendedHooks = {
  getPageData,
  handlePageRequest,
  modifyHtml
};
