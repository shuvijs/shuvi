import { RequestListener } from 'http';
import url from 'url';
import { joinPath } from '@shuvi/utils/lib/string';
import { IPluginContext } from '../core';
import { normalizeServerMiddleware } from './serverMiddleware';
import { Server, IRequestHandlerWithNext } from './http-server';
import {
  IShuviServer,
  ShuviServerOptions,
  ShuviRequest
} from './shuviServerTypes';
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

  constructor(corePluginContext: IPluginContext, options: ShuviServerOptions) {
    this._pluginManager = getManager();
    this._server = new Server();
    this._options = options;
    const serverPlugins = options.serverPlugins;
    this._serverContext = initServerPlugins(
      this._pluginManager,
      serverPlugins,
      corePluginContext
    );
  }

  abstract init(): Promise<void>;

  protected async _initMiddlewares() {
    const { _serverContext: context, _server: server } = this;

    server.use(((req, _resp, next) => {
      const shuviReq = req as ShuviRequest;
      const requestTime: number = Date.now();
      shuviReq.getAssetUrl = (assetPath: string) => {
        const fullAssetPath = joinPath(
          this._serverContext.assetPublicPath,
          assetPath
        );

        if (this._serverContext.mode === 'development') {
          const urlObj = url.parse(fullAssetPath);
          const urlSearchParams = new URLSearchParams(urlObj.search!);
          // force to invalidate cache in dev
          urlSearchParams.set('_ts', requestTime.toString());
          return `${urlObj.pathname}?${urlSearchParams.toString()}`;
        }

        return fullAssetPath;
      };

      next();
    }) as IRequestHandlerWithNext);

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
