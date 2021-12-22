import { IPluginContext } from '../core';
import { IShuviServer } from './shuviServerTypes';

export * from './http-server';

export * from './plugin';

export * from './shuviServerTypes';

export interface CreateShuviServerOptions {
  context: IPluginContext;
  dev?: boolean;
}

export async function createShuviServer({
  context,
  dev = false
}: CreateShuviServerOptions) {
  let server: IShuviServer;
  if (dev) {
    const { ShuviDevServer } = require('./shuviDevServer');
    server = new ShuviDevServer(context, {});
  } else {
    const { ShuviProdServer } = require('./shuviProdServer');
    server = new ShuviProdServer(context, {});
  }

  await server.init();
  return server;
}
