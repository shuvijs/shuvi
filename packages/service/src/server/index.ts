import { IPluginContext } from '../core';
import { IShuviServer, ShuviServerOptions } from './shuviServerTypes';
import { Bunlder } from '../bundler';

export * from './http-server';

export * from './plugin';

export * from './shuviServerTypes';

export interface CreateShuviDevServerOptions extends ShuviServerOptions {
  context: IPluginContext;
  bundler: Bunlder;
  dev: true;
}

export interface CreateShuviProdServerOptions extends ShuviServerOptions {
  context: IPluginContext;
  dev?: false;
}

export type CreateShuviServerOptions =
  | CreateShuviDevServerOptions
  | CreateShuviProdServerOptions;

export async function createShuviServer({
  context,
  dev = false,
  ...rest
}: CreateShuviServerOptions) {
  let server: IShuviServer;
  if (dev) {
    const { ShuviDevServer } = require('./shuviDevServer');
    server = new ShuviDevServer(context, rest);
  } else {
    const { ShuviProdServer } = require('./shuviProdServer');
    server = new ShuviProdServer(context, rest);
  }

  await server.init();
  return server;
}
