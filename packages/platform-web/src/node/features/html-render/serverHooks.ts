import { IncomingMessage, ServerResponse } from 'http';
import {
  createSyncWaterfallHook,
  createAsyncParallelHook,
  createAsyncSeriesHook,
  createAsyncSeriesWaterfallHook
} from '@shuvi/hook';
import { ShuviRequest } from '@shuvi/service';
import { IAppContext } from '@shuvi/platform-shared/shared';
import { IHtmlDocument } from '../html-render';

export interface ModifyHtmlContext {
  req: ShuviRequest;
  appContext: IAppContext;
}

export type IHandlePageRequest = (
  req: IncomingMessage,
  res: ServerResponse
) => Promise<void>;

export type ISendHtml = (
  req: IncomingMessage,
  res: ServerResponse,
  html: string
) => Promise<void>;

const getPageData = createAsyncParallelHook<
  void,
  IAppContext,
  Record<string, unknown>
>();
const handlePageRequest = createSyncWaterfallHook<IHandlePageRequest>();
const modifyHtml = createAsyncSeriesHook<IHtmlDocument, ModifyHtmlContext>();
const sendHtml = createAsyncSeriesWaterfallHook<ISendHtml>();

export const extendedHooks = {
  getPageData,
  handlePageRequest,
  modifyHtml,
  sendHtml
};
