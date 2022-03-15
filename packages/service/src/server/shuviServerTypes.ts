import { RequestListener } from 'http';
import { IPlugin, IPlatformContent } from '../core';

export interface IShuviServer {
  init(): Promise<void>;
  listen(port: number, hostname?: string): Promise<void>;
  close(): Promise<void>;
  getRequestHandler(): RequestListener;
}

export interface ShuviServerOptions {
  serverPlugins: IPlugin[];
  getMiddlewares?: IPlatformContent['getMiddlewares'];
  getMiddlewaresBeforeDevMiddlewares?: IPlatformContent['getMiddlewaresBeforeDevMiddlewares'];
}
