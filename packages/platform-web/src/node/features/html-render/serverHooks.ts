import { ServerResponse } from 'http';
import {
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
  req: ShuviRequest,
  res: ServerResponse
) => Promise<void>;

export type RequestContext = {
  req: ShuviRequest;
  res: ServerResponse;
};

export type ISendHtml = (
  html: string,
  requestContext: RequestContext
) => Promise<void>;

const getPageData = createAsyncParallelHook<
  void,
  IAppContext,
  Record<string, unknown>
>();
const handlePageRequest = createAsyncSeriesWaterfallHook<IHandlePageRequest>();
const modifyHtml = createAsyncSeriesHook<IHtmlDocument, ModifyHtmlContext>();
const sendHtml = createAsyncSeriesWaterfallHook<ISendHtml>();

export const extendedHooks = {
  getPageData,
  handlePageRequest,
  modifyHtml,
  sendHtml
};
