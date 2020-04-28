import { IncomingHttpHeaders } from 'http';
import { UrlWithParsedQuery } from 'url';
import { Api } from '../api';

export type IRenderRequest = {
  url: string;
  parsedUrl?: UrlWithParsedQuery;
  headers?: IncomingHttpHeaders;
  [x: string]: any;
};

export interface IRendererOptions {
  api: Api;
}

export interface IRendererContext {
  appData: Record<string, any>;
}

