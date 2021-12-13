import { ICliContext } from '../api';
import { normalizeServerMiddleware } from '../api/serverMiddleware';
import { IServerPluginContext } from './serverHooks';
import { Server } from './http-server';
import { IShuviServer, ShuviServerOptions } from './shuviServerTypes';
import { PluginManager, getManager, initServerPlugins } from './serverHooks';

export abstract class ShuviServer implements IShuviServer {
  // rootDir: string;

  protected _server: Server;
  protected _pluginManager: PluginManager;
  protected _serverContext: IServerPluginContext;

  constructor(cliContext: ICliContext, options: ShuviServerOptions) {
    // this.rootDir = options.rootDir;
    this._pluginManager = getManager();
    this._server = new Server();
    const serverPlugins = cliContext.serverPlugins;
    this._serverContext = initServerPlugins(
      this._pluginManager,
      serverPlugins,
      cliContext
    );
  }

  abstract init(): Promise<void>;

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
