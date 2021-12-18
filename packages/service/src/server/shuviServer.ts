import path from 'path';
import { PUBLIC_PATH } from '../constants';
import {
  normalizeServerMiddleware,
  NormalizedServerMiddleware
} from './serverMiddleware';
import { Server } from './http-server';
import {
  IShuviServer,
  ShuviServerOptions,
  NormalizedShuviServerConfig,
  IShuviServerMode,
  IShuviServerPhase,
  IResources,
  IPaths,
  IPlatform,
  IUserRouteConfig,
  IApiRouteConfig
} from './shuviServerTypes';
import { PluginManager, getManager, IServerPluginInstance } from '../plugin';
import { getPaths } from './paths';
import { normalizeConfig } from './config';

function getPlatform(platform: string | undefined): IPlatform {
  const platformName = `@shuvi/platform-${platform}`;
  const platformInstance: IPlatform = require(platformName).default;
  return platformInstance;
}

export abstract class ShuviServer implements IShuviServer {
  protected _rootDir: string;
  protected _config: NormalizedShuviServerConfig;
  protected _server: Server;
  protected _pluginManager: PluginManager;

  private _pageRoutes: IUserRouteConfig[] = [];
  // @ts-ignore
  private _apiRoutes: IApiRouteConfig[] = [];
  private _phase: IShuviServerPhase;
  private _plugins: IServerPluginInstance[];
  private _resources: IResources;
  private _paths: IPaths;
  private _middlewares: NormalizedServerMiddleware[];
  private _afterMiddlewares: NormalizedServerMiddleware[];

  constructor({ rootDir, config, plugins = [] }: ShuviServerOptions) {
    this._rootDir = path.resolve(rootDir);
    this._config = normalizeConfig(config);
    this._phase = IShuviServerPhase.PHASE_INIT;
    this._plugins = plugins;
    this._server = new Server();
    this._pluginManager = getManager();
    this._resources = {};
    this._paths = getPaths({
      rootDir,
      outputPath: this._config.publicDir,
      publicDir: this._config.publicDir
    });
    this._pageRoutes = [];
    this._apiRoutes = [];
    this._middlewares = [];
    this._afterMiddlewares = [];
  }

  // TODO: rethink on this
  get resources(): IResources {
    return this._resources;
  }

  get assetPublicPath(): string {
    let prefix =
      this.mode === 'development' ? PUBLIC_PATH : this._config.publicPath;

    if (!prefix.endsWith('/')) {
      prefix += '/';
    }

    return prefix;
  }

  abstract get mode(): IShuviServerMode;

  async init() {
    // self init
    await this._initPlugin();
    await Promise.all([this._initResource(), this._initMiddlewares()]);

    // subclass init
    await this._init();

    this._middlewares.forEach(({ path, handler }) =>
      this._server.use(path, handler)
    );
    this._afterMiddlewares.forEach(({ path, handler }) =>
      this._server.use(path, handler)
    );
  }

  async listen(port: number, hostname?: string) {
    await this._server.listen(port, hostname);
    await this._pluginManager.runner.serverListen({ port, hostname });
  }

  async close() {
    await this._server.close();
  }

  abstract _init(): Promise<void>;

  private async _initPlugin() {
    const { _pluginManager: pluginManager, _plugins: plugins } = this;
    const pluginContext = this._getPluginContext();
    pluginManager.setContext(pluginContext);

    const platform = getPlatform(this._config.platform.name);
    const platformPlugins = await platform(pluginContext);
    pluginManager.usePlugin(...platformPlugins);

    for (const plugin of plugins) {
      pluginManager.usePlugin(plugin);
    }
    await pluginManager.runner.setup();
  }

  private async _initMiddlewares() {
    const { _pluginManager: pluginManager } = this;
    const context = this._getPluginContext();
    const { rootDir } = context.paths;
    this._middlewares = (await pluginManager.runner.serverMiddleware())
      .flat()
      .map(m => normalizeServerMiddleware(m, { rootDir }))
      .sort((a, b) => a.order - b.order);
    this._afterMiddlewares = (await pluginManager.runner.serverMiddlewareLast())
      .flat()
      .map(m => normalizeServerMiddleware(m, { rootDir }))
      .sort((a, b) => a.order - b.order);
  }

  private async _initResource() {
    const bundleResources = (
      await this._pluginManager.runner.bundleResource()
    ).flat();
    bundleResources.forEach(({ identifier, loader }) => {
      this._addResoure(identifier, loader);
    });
  }

  protected _getPluginContext() {
    return {
      mode: this.mode,
      paths: this._paths,
      config: this._config,
      phase: this._phase,
      pluginRunner: this._pluginManager.runner,
      // resources
      resources: this.resources,
      assetPublicPath: this.assetPublicPath,
      getRoutes: () => this._pageRoutes
    };
  }

  // protected async _setPageRoutes(routes: IUserRouteConfig[]): Promise<void> {
  //   routes = await this._pluginManager.runner.appRoutes(routes);
  //   this._pageRoutes = routes;
  // }

  private _addResoure(identifier: string, loader: () => any): void {
    const cacheable = this.mode === 'production';
    const api = this;
    // TODO: warn exitsed identifier
    if (cacheable) {
      Object.defineProperty(api._resources, identifier, {
        get() {
          const value = loader();
          Object.defineProperty(api._resources, identifier, {
            value,
            enumerable: true,
            configurable: false,
            writable: false
          });
          return value;
        },
        enumerable: true,
        configurable: true
      });
    } else {
      Object.defineProperty(this._resources, identifier, {
        get() {
          return loader();
        },
        enumerable: true,
        configurable: false
      });
    }
  }
}
