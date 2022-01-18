import { IPluginContext } from '../core';
import { normalizeServerMiddleware } from './serverMiddleware';
import { Server } from './http-server';
import { IShuviServer, ShuviServerOptions } from './shuviServerTypes';
import { PluginManager, getManager, initServerContext, initServerPlugins, IServerPluginContext } from './plugin';
import { addAlias } from './moduleAlias'

export abstract class ShuviServer implements IShuviServer {
  protected _server: Server;
  protected _pluginManager: PluginManager;
  protected _serverContext: IServerPluginContext;
  protected _cliContext: IPluginContext;

  constructor(cliContext: IPluginContext, options: ShuviServerOptions) {
    addAlias('@shuvi/service/resources', cliContext.paths.resourcesDir)
    this._pluginManager = getManager();
    this._server = new Server();
    this._cliContext = cliContext;
    this._serverContext = initServerContext(
      this._pluginManager,
      this._cliContext
    );
  }

  abstract init(): Promise<void>;

  protected _initServerPlugins(){
    const serverPlugins = this._cliContext.serverPlugins;
    initServerPlugins(
      this._pluginManager,
      serverPlugins,
      this._serverContext
    )
  }

  protected async _initMiddlewares() {
    const {
      _serverContext: context,
      _server: server,
      _pluginManager: pluginManager
    } = this;

    const { rootDir } = context.paths;
    const serverMiddlewares = (await pluginManager.runner.serverMiddleware())
      .flat()
      .map(m => normalizeServerMiddleware(m, { rootDir }))
      .sort((a, b) => a.order - b.order);
    const serverMiddlewaresLast = (
      await pluginManager.runner.serverMiddlewareLast()
    )
      .flat()
      .map(m => normalizeServerMiddleware(m, { rootDir }))
      .sort((a, b) => a.order - b.order);
    serverMiddlewares.forEach(({ path, handler }) => {
      server.use(path, handler);
    });
    serverMiddlewaresLast.forEach(({ path, handler }) => {
      server.use(path, handler);
    });
  }

  async listen(port: number, hostname?: string) {
    await this._server.listen(port, hostname);
    await this._pluginManager.runner.serverListen({ port, hostname });
  }

  async close() {
    await this._server.close();
  }
}
