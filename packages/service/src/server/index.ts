import { IPluginContext } from '../core';
import { IShuviServer, ShuviServerOptions } from './shuviServerTypes';

export * from './http-server';

export * from './plugin';

export * from './shuviServerTypes';

export interface CreateShuviServerOptions extends ShuviServerOptions {
  context: IPluginContext;
  dev?: boolean;
}

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
