import { IShuviServer, ShuviServerOptions } from './shuviServerTypes';

export * from './http-server';

export * from './paths';

export {
  getManager,
  createPlugin as createServerPlugin,
  PluginRunner,
  PluginManager,
  IServerPluginInstance,
  IServerPluginConstructor
} from './plugin';

export * from './shuviServerTypes';

export interface CreateShuviServerOptions extends ShuviServerOptions {
  dev?: boolean;
}

export async function createShuviServer({
  dev = false
}: CreateShuviServerOptions) {
  let server: IShuviServer;
  if (dev) {
    const { ShuviDevServer } = require('./shuviDevServer');
    server = new ShuviDevServer({});
  } else {
    const { ShuviProdServer } = require('./shuviProdServer');
    server = new ShuviProdServer({});
  }

  await server.init();
  return server;
}
