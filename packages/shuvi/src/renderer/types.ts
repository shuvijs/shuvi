import { Runtime } from '@shuvi/types';
import { IncomingHttpHeaders } from 'http';
import { UrlWithParsedQuery } from 'url';
import { Api } from '../api';

export interface IRendererConstructorOptions {
  api: Api;
}

export interface IServerRendererContext {
  appData: Record<string, any>;
}

export type IRenderRequest = {
  url: string;
  parsedUrl?: UrlWithParsedQuery;
  headers?: IncomingHttpHeaders;
  [x: string]: any;
};

export type IRenderDocumentOptions = {
  req: IRenderRequest;
  AppComponent: any;
  routes: Runtime.IRoute[];
  appContext: any;
};
