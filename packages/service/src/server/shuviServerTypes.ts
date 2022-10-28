import { RequestListener } from 'http';
import { ServerPluginInstance } from './plugin';
import { IPlatformContent } from '../core';
import { Bundler } from '../bundler';
import {
  IRequest,
  IResponse,
  IRequestHandlerWithNext
} from '../server/http-server';

import type { getCookieParser } from './utils';

export interface CustomShuviRequest {}

export interface CustomShuviResponse {}

export interface ShuviRequest extends IRequest, CustomShuviRequest {
  getAssetUrl(assetPath: string): string;
  cookies: ReturnType<typeof getCookieParser>;
}

export interface ShuviResponse extends IResponse, CustomShuviResponse {}

export type ShuviRequestHandler = IRequestHandlerWithNext<
  ShuviRequest,
  ShuviResponse
>;

export interface IShuviServer {
  init(): Promise<void>;
  listen(port: number, hostname?: string): Promise<void>;
  close(): Promise<void>;
  getRequestHandler(): RequestListener;
}

export interface ShuviServerOptions {
  serverPlugins: ServerPluginInstance[];
  getMiddlewares?: IPlatformContent['getMiddlewares'];
  getMiddlewaresBeforeDevMiddlewares?: IPlatformContent['getMiddlewaresBeforeDevMiddlewares'];
}

export interface ShuviDevServerOptions extends ShuviServerOptions {
  bundler: Bundler;
}
