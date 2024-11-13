import { ServerResponse } from 'http';
import {
  createAsyncParallelHook,
  createAsyncSeriesHook,
  createAsyncSeriesWaterfallHook,
  createSyncBailHook
} from '@shuvi/hook';
import { ShuviRequest, IAppConfigByRequest } from '@shuvi/service';
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

type AppConfigCtx = {
  req: ShuviRequest;
};

const getPageData = createAsyncParallelHook<
  void,
  IAppContext,
  Record<string, any>
>();
const handlePageRequest = createAsyncSeriesWaterfallHook<IHandlePageRequest>();
const modifyHtml = createAsyncSeriesHook<IHtmlDocument, ModifyHtmlContext>();
const sendHtml = createAsyncSeriesWaterfallHook<ISendHtml>();

export const getAppConfig = createSyncBailHook<
  void,
  AppConfigCtx,
  IAppConfigByRequest
>();

export const extendedHooks = {
  getPageData,
  getAppConfig,
  handlePageRequest,
  modifyHtml,
  sendHtml
};
