import path from 'path';
import {
  IApiConfig,
  IApi,
  APIHooks,
  ISpecifier,
  IPaths,
  IShuviMode
} from '@shuvi/types';
import { App, IRouteConfig, IFile } from '@shuvi/core';
import { joinPath } from '@shuvi/utils/lib/string';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import { Hookable } from '@shuvi/hooks';
import { setRuntimeConfig } from '../lib/runtimeConfig';
import { serializeRoutes, normalizeRoutes } from '../lib/routes';
import { PUBLIC_PATH, ROUTE_RESOURCE_QUERYSTRING } from '../constants';
import { runtime } from '../runtime';
import { defaultConfig, IConfig, loadConfig } from '../config';
import { IResources, IBuiltResource, IPlugin } from './types';
import { Server } from '../server';
import { setupApp } from './setupApp';
import { initCoreResource } from './initCoreResource';
import { resolvePlugins } from './plugin';
import { createPluginApi, PluginApi } from './pluginApi';
import { getPaths } from './paths';

const ServiceModes: IShuviMode[] = ['development', 'production'];

interface IApiOPtions {
  cwd?: string;
  mode?: IShuviMode;
  config?: IConfig;
  configFile?: string;
}

class Api extends Hookable implements IApi {
  private _cwd: string;
  private _mode: IShuviMode;
  private _userConfig?: IConfig;
  private _config!: IApiConfig;
  private _configFile?: string;
  private _paths!: IPaths;
  private _app!: App;
  private _server!: Server;
  private _resources: IResources = {} as IResources;
  private _routes: IRouteConfig[] = [];
  private _plugins!: IPlugin[];
  private _pluginApi!: PluginApi;

  constructor({ cwd, mode, config, configFile }: IApiOPtions) {
    super();
    if (mode) {
      this._mode = mode;
    } else if (ServiceModes.includes(process.env.NODE_ENV as any)) {
      this._mode = process.env.NODE_ENV as any;
    } else {
      this._mode = 'production';
    }

    this._cwd = path.resolve(cwd || '.');
    this._configFile = configFile;
    this._userConfig = config;
  }

  get mode() {
    return this._mode;
  }

  get config() {
    return this._config;
  }

  get paths() {
    return this._paths;
  }

  async init() {
    this._app = new App();

    const configFromFile = await loadConfig({
      rootDir: this._cwd,
      configFile: this._configFile,
      overrides: this._userConfig
    });

    const config: IApiConfig = deepmerge(defaultConfig, configFromFile);

    // init plugins
    this._plugins = resolvePlugins(config.plugins || [], {
      dir: config.rootDir
    });

    let runPlugins = function runNext(
      next?: Function,
      cur: Function = () => void 0
    ) {
      if (next) {
        return (n: Function) =>
          runNext(n, () => {
            cur();
            next();
          });
      }
      return cur();
    };
    for (const plugin of this._plugins) {
      const pluginInst = plugin.get();
      if (typeof pluginInst.modifyConfig === 'function') {
        this.tap<APIHooks.IHookGetConfig>('getConfig', {
          name: 'pluginModifyConfig',
          fn(config) {
            return pluginInst.modifyConfig!(config);
          }
        });
      }
      runPlugins = runPlugins(() => {
        pluginInst.apply(this.getPluginApi());
      });
    }

    // prepare all properties befofre run plugins, so plugin can use all api of Api
    this._config = await this.callHook<APIHooks.IHookGetConfig>({
      name: 'getConfig',
      initialValue: config
    });
    // do not allow to modify config
    Object.freeze(this._config);
    this._paths = getPaths({
      rootDir: this._config.rootDir,
      outputPath: this._config.outputPath,
      publicDir: this._config.publicDir
    });
    // do not allow to modify paths
    Object.freeze(this._paths);

    runPlugins();

    initCoreResource(this);
    // TODO?: move into application
    if (typeof this.config.runtimeConfig === 'object') {
      setRuntimeConfig(this.config.runtimeConfig);
    }
  }

  get server() {
    if (!this._server) {
      this._server = new Server({
        proxy: this.config.proxy
      });
    }

    return this._server;
  }

  get assetPublicPath(): string {
    let prefix =
      this.mode === 'development'
        ? PUBLIC_PATH
        : this.config.publicPath || PUBLIC_PATH;

    if (!prefix.endsWith('/')) {
      prefix += '/';
    }

    return prefix;
  }

  get resources(): IBuiltResource {
    return this._resources;
  }

  setViewModule(path: string) {
    this._app.setViewModule(path);
  }

  setAppModule(module: string | string[]) {
    this._app.setAppModule(module);
  }

  setPluginModule(module: string | string[]) {
    this._app.setPluginModule(module);
  }

  async setRoutes(routes: IRouteConfig[]) {
    routes = await this.callHook<APIHooks.IHookAppRoutes>({
      name: 'app:routes',
      initialValue: routes
    });

    routes = normalizeRoutes(routes, {
      componentDir: this.paths.pagesDir
    });
    routes.push({
      path: '*',
      component: this.resolveAppFile('core', 'error'),
      name: 'notFound'
    });

    this._routes = routes;

    const serialized = serializeRoutes(routes, {
      component(comp, route) {
        return runtime.componentTemplate(
          `${comp}?${ROUTE_RESOURCE_QUERYSTRING}`,
          route
        );
      }
    });

    let content = `export default ${serialized}`;
    content = await this.callHook<APIHooks.IHookAppRoutesFile>({
      name: 'app:routesFile',
      initialValue: content
    });
    this._app.setRoutesContent(content);
  }

  getRoutes() {
    return this._routes;
  }

  async buildApp(): Promise<void> {
    await setupApp(this);

    if (this.mode === 'production') {
      await this._app.buildOnce({ dir: this.paths.appDir });
    } else {
      await this._app.build({ dir: this.paths.appDir });
    }

    // prevent webpack watch running too early
    // https://github.com/webpack/webpack/issues/7997
    await new Promise(resolve => {
      setTimeout(resolve, 1000);
    });

    this.emitEvent<APIHooks.IEventAppReady>('app:ready');
  }

  addResoure(identifier: string, loader: () => any): void {
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
            configurable: true,
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
        configurable: true
      });
    }
  }

  addEntryCode(content: string): void {
    this._app.addEntryCode(content);
  }

  addAppFile(file: IFile, dir = ''): void {
    this._app.addFile(file, dir.startsWith('/') ? dir : `/${dir}`);
  }

  addAppExport(source: string, specifier: ISpecifier | ISpecifier[]): void {
    this._app.addExport(source, specifier);
  }

  addAppPolyfill(file: string): void {
    this._app.addPolyfill(file);
  }

  addRuntimePlugin(name: string, runtimePlugin: string): void {
    this._app.addRuntimePlugin(name, runtimePlugin);
  }

  getAssetPublicUrl(...paths: string[]): string {
    return joinPath(this.assetPublicPath, ...paths);
  }

  resolveAppFile(...paths: string[]): string {
    return joinPath(this.paths.appDir, ...paths);
  }

  resolveUserFile(...paths: string[]): string {
    return joinPath(this.paths.srcDir, ...paths);
  }

  resolveBuildFile(...paths: string[]): string {
    return joinPath(this.paths.buildDir, ...paths);
  }

  resolvePublicFile(...paths: string[]): string {
    return joinPath(this.paths.publicDir, ...paths);
  }

  getPluginApi(): PluginApi {
    if (!this._pluginApi) {
      this._pluginApi = createPluginApi(this);
    }

    return this._pluginApi;
  }

  async destory() {
    if (this._server) {
      await this._server.close();
    }
    this._app.stopBuild(this.paths.appDir);
    await this.callHook<APIHooks.IHookDestory>('destory');
  }
}

export type { Api };

export async function getApi({
  cwd,
  mode,
  config,
  configFile
}: IApiOPtions): Promise<Api> {
  const api = new Api({ cwd, mode, config, configFile });

  await api.init();
  return api;
}
