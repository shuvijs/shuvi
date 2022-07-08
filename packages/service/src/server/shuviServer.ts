import { RequestListener } from 'http';
import { IPluginContext } from '../core';
import { normalizeServerMiddleware } from './serverMiddleware';
import { Server } from './http-server';
import { IShuviServer, ShuviServerOptions } from './shuviServerTypes';
import {
  PluginManager,
  getManager,
  initServerPlugins,
  IServerPluginContext
} from './plugin';

export abstract class ShuviServer implements IShuviServer {
  protected _server: Server;
  protected _pluginManager: PluginManager;
  protected _serverContext: IServerPluginContext;
  protected _options: ShuviServerOptions;

  constructor(cliContext: IPluginContext, options: ShuviServerOptions) {
    this._pluginManager = getManager();
    this._server = new Server();
    this._options = options;
    const serverPlugins = options.serverPlugins;
    this._serverContext = initServerPlugins(
      this._pluginManager,
      serverPlugins,
      cliContext
    );
  }

  abstract init(): Promise<void>;

  protected async _initMiddlewares() {
    const { _serverContext: context, _server: server } = this;

    const { rootDir } = context.paths;
    if (this._options.getMiddlewares) {
      const serverMiddlewares = [this._options.getMiddlewares(context)]
        .flat()
        .map(m => normalizeServerMiddleware(m, { rootDir }));
      serverMiddlewares.forEach(({ path, handler }) => {
        server.use(path, handler);
      });
    }
  }

  async listen(port: number, hostname?: string) {
    await this._server.listen(port, hostname);
    await this._pluginManager.runner.listen({ port, hostname });
  }

  async close() {
    await this._server.close();
  }

  getRequestHandler(): RequestListener {
    return this._server.getRequestHandler();
  }
}
