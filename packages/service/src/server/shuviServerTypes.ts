import { RequestListener } from 'http';
import { ServerPluginInstance } from '.';
import { IPlatformContent } from '../core';
import { Server } from '../server/http-server';

export interface IShuviServer {
  init(): Promise<void>;
  listen(port: number, hostname?: string): Promise<void>;
  close(): Promise<void>;
  getRequestHandler(): RequestListener;
  setupWebSocketHandler?(server?: Server): void;
}

export interface ShuviServerOptions {
  serverPlugins: ServerPluginInstance[];
  getMiddlewares?: IPlatformContent['getMiddlewares'];
  getMiddlewaresBeforeDevMiddlewares?: IPlatformContent['getMiddlewaresBeforeDevMiddlewares'];
}
