import { RequestListener } from 'http';
import { ServerPluginInstance } from './plugin';
import { IPlatformContent } from '../core';
import { Bunlder } from '../bundler';
import { Server } from '../server/http-server';
import { DevMiddleware } from './middlewares/dev/devMiddleware';

export interface IShuviServer {
  init(): Promise<void>;
  listen(port: number, hostname?: string): Promise<void>;
  close(): Promise<void>;
  getRequestHandler(): RequestListener;
  setupWebSocketHandler?(server: Server, devMiddleware: DevMiddleware): void;
}

export interface ShuviServerOptions {
  serverPlugins: ServerPluginInstance[];
  getMiddlewares?: IPlatformContent['getMiddlewares'];
  getMiddlewaresBeforeDevMiddlewares?: IPlatformContent['getMiddlewaresBeforeDevMiddlewares'];
}

export interface ShuviDevServerOptions extends ShuviServerOptions {
  bundler: Bunlder;
}
