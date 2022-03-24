import { RequestListener } from 'http';
import { ServerPluginInstance } from '.';
import { IPlatformContent } from '../core';

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
