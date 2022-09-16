import { IncomingMessage, ServerResponse } from 'http';
import {
  createSyncWaterfallHook,
  createAsyncParallelHook,
  createAsyncSeriesHook
} from '@shuvi/hook';
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
const modifyHtml = createAsyncSeriesHook<IHtmlDocument, IAppContext>();

export const extendedHooks = {
  getPageData,
  handlePageRequest,
  modifyHtml
};
