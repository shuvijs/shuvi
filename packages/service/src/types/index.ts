import { IncomingMessage, ServerResponse } from 'http';
import { IRequest, IMiddlewareHandler, IServerMiddlewareItem } from './server';

import { IApi, IApiRouteConfig, IUserRouteConfig } from '../api';

import {
  IRouteMatch,
  IRouteRecord,
  IRedirectState,
  IRouter
} from '@shuvi/router';

import {
  IRenderOptions,
  IView,
  IApplicationCreaterServerContext
} from '@shuvi/runtime-core';
import { IManifest } from '@shuvi/toolpack/lib/webpack/types';

export interface ITemplateData {
  [x: string]: any;
}

export interface IRuntime {
  install(api: IApi): void;
}

export { IUserRouteConfig, IApiRouteConfig };

export type IMatchedRoute<T = IRouteRecord> = IRouteMatch<T>;

export type IHtmlAttrs = { textContent?: string } & {
  [x: string]: string | number | undefined | boolean;
};

export interface IHtmlTag<TagNames = string> {
  tagName: TagNames;
  attrs: IHtmlAttrs;
  innerHTML?: string;
}

export interface IDocumentProps {
  htmlAttrs: IHtmlAttrs;
  headTags: IHtmlTag<
    'meta' | 'link' | 'style' | 'script' | 'noscript' | 'title'
  >[];
  mainTags: IHtmlTag[];
  scriptTags: IHtmlTag<'script'>[];
}

interface IServerAppContext {
  req: IRequest;
  [x: string]: any;
}

export type IRenderAppResult<Data = {}> = {
  htmlAttrs?: IHtmlAttrs;
  headBeginTags?: IHtmlTag[];
  headEndTags?: IHtmlTag[];
  mainBeginTags?: IHtmlTag[];
  mainEndTags?: IHtmlTag[];
  scriptBeginTags?: IHtmlTag[];
  scriptEndTags?: IHtmlTag[];
  appData?: Data;
  appHtml?: string;
  redirect?: IRedirectState;
};

export interface IServerRendererOptions<
  CompType = any,
  Router extends IRouter<any> = IRouter<any>
> extends IRenderOptions<IApplicationCreaterServerContext, Router> {
  router: Router;
  manifest: IManifest;
  getAssetPublicUrl(path: string): string;
}

export interface IViewServer<CompType = any, Data = {}>
  extends IView<
    IServerRendererOptions<CompType, IRouter<any>>,
    Promise<IRenderAppResult<Data>>
  > {}

export interface ITelestore {
  get<T = unknown>(key: string, defaultValue?: T): T | undefined;
  set(key: string, value: any): void;
  dump(): Record<string, any>;
}

export interface IRenderResultRedirect extends IRedirectState {
  $type: 'redirect';
}

export interface IDocumentModule {
  onDocumentProps(
    documentProps: IDocumentProps,
    context: IServerAppContext
  ): Promise<IDocumentProps> | IDocumentProps;
  getTemplateData(
    context: IServerAppContext
  ): Promise<ITemplateData> | ITemplateData;
}

export interface IServerModule {
  render?(
    renderAppToString: () => string,
    appContext: IServerAppContext
  ): string;
  serverMiddleware: (IServerMiddlewareItem | IMiddlewareHandler)[];
  onViewDone?(
    req: IncomingMessage,
    res: ServerResponse,
    payload: {
      html: string | null;
      appContext: any;
    }
  ): void;
}
