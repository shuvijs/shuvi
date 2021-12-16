import { ShuviServer } from './shuviServer';
import {
  IPluginContext,
  ShuviServerOptions,
  IUserRouteConfig,
  IApiRouteConfig,
  IMiddlewareRouteConfig
} from './shuviServerTypes';
import { IRequestHandlerWithNext } from '../server/http-server';
import { serveStatic } from '../lib/serveStatic';
import { OnDemandRouteManager } from '../lib/onDemandRouteManager';
import { ProjectBuilder } from '../project';
import { getDevMiddleware } from './middlewares/devMiddleware';
import { applyHttpProxyMiddleware } from './middlewares/httpProxyMiddleware';
import { resolvePath } from './paths';
import { generateAppSourceFiles } from './helper/project';
import { serializeRoutes } from './helper/routes';
import { serializeApiRoutes } from './helper/apiRoutes';
import { serializeMiddlewareRoutes } from './helper/middlewaresRoutes';

const getPublicDirMiddleware = (
  context: IPluginContext
): IRequestHandlerWithNext => {
  return async (req, res, next) => {
    let { path = '' } = req.params || {};
    if (Array.isArray(path)) path = path.join('/');
    const assetAbsPath = resolvePath(context.paths.publicDir, path);
    let err = null;
    try {
      await serveStatic(req, res, assetAbsPath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        error.statusCode = 404;
      }
      err = error;
    }
    if (err) next(err);
  };
};

export class ShuviDevServer extends ShuviServer {
  private _projectBuilder: ProjectBuilder;

  constructor(options: ShuviServerOptions) {
    super(options);
    this._projectBuilder = new ProjectBuilder({
      static: false
    });
  }

  get mode() {
    return 'development' as const;
  }

  async init() {
    const { _server: server, _pluginManager: pluginManager } = this;

    await this._initPlugin();

    this._projectBuilder = await generateAppSourceFiles({
      builder: this._projectBuilder,
      rootDir: this._rootDir,
      config: this._config,
      runner: pluginManager.runner
    });

    const pluginContext = this._getPluginContext();
    const onDemandRouteMgr = new OnDemandRouteManager(pluginContext);
    const publicDirMiddleware = getPublicDirMiddleware(pluginContext);
    const devMiddleware = await getDevMiddleware(pluginContext);
    await devMiddleware.waitUntilValid();
    onDemandRouteMgr.devMiddleware = devMiddleware;
    if (pluginContext.config.proxy) {
      applyHttpProxyMiddleware(server, pluginContext.config.proxy);
    }
    // keep the order
    server.use(onDemandRouteMgr.getServerMiddleware());
    devMiddleware.apply(server);
    server.use(onDemandRouteMgr.ensureRoutesMiddleware());
    server.use(
      `${pluginContext.assetPublicPath}:path(.*)`,
      publicDirMiddleware
    );

    await this._initMiddlewares();
  }

  protected async _setPageRoutes(routes: IUserRouteConfig[]): Promise<void> {
    await super._setPageRoutes(routes);
    const serialized = serializeRoutes(routes);
    this._projectBuilder.setRoutesContent(`export default ${serialized}`);
  }

  protected async _setApiRoutes(routes: IApiRouteConfig[]): Promise<void> {
    await super._setApiRoutes(routes);
    const { prefix } = this._config.apiConfig || {};
    const serialized = serializeApiRoutes(routes, prefix);
    let content = `export default ${serialized}`;
    this._projectBuilder.setApiRoutesContent(content);
  }

  protected async _setMiddlewaresRoutes(
    routes: IMiddlewareRouteConfig[]
  ): Promise<void> {
    await super._setMiddlewaresRoutes(routes);
    const serialized = serializeMiddlewareRoutes(routes);
    let content = `export default ${serialized}`;
    this._projectBuilder.setMiddlewareRoutesContent(content);
  }
}
