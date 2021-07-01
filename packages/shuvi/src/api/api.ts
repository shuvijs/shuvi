import path from 'path';
import {
  IApiConfig,
  IApi,
  APIHooks,
  IPaths,
  IShuviMode,
  Runtime,
  IPhase,
  Bundler
} from '@shuvi/types';
import { ProjectBuilder, IUserRouteConfig, FileOptions } from '@shuvi/core';
import { joinPath } from '@shuvi/utils/lib/string';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import invariant from '@shuvi/utils/lib/invariant';
import { Hookable } from '@shuvi/hooks';
import coreRuntime from '@shuvi/runtime-core';

import { setRuntimeConfig } from '../lib/runtimeConfig';
import { serializeRoutes, normalizeRoutes } from '../lib/routes';
import {
  PUBLIC_PATH,
  ROUTE_RESOURCE_QUERYSTRING,
  ROUTE_NOT_FOUND_NAME
} from '../constants';
import { runtime } from '../runtime';
import { defaultConfig, IConfig, loadConfig } from '../config';
import { IResources, IBuiltResource, IPlugin, IPreset } from './types';
import { Server } from '../server';
import { setupApp } from './setupApp';
import { initCoreResource } from './initCoreResource';
import { resolvePlugins, resolvePresets } from './plugin';
import { createPluginApi, PluginApi } from './pluginApi';
import { getPaths } from './paths';
import { normalizeServerMiddleware } from './serverMiddleware';

const ServiceModes: IShuviMode[] = ['development', 'production'];

interface IApiOPtions {
  cwd?: string;
  mode?: IShuviMode;
  config?: IConfig;
  configFile?: string;
  phase?: IPhase;
}

class Api extends Hookable implements IApi {
  private _cwd: string;
  private _mode: IShuviMode;
  private _userConfig?: IConfig;
  private _config!: IApiConfig;
  private _configFile?: string;
  private _paths!: IPaths;
  private _projectBuilder!: ProjectBuilder;
  private _server!: Server;
  private _resources: IResources = {} as IResources;
  private _routes: IUserRouteConfig[] = [];
  private _presetPlugins: IPlugin[] = [];
  private _plugins!: IPlugin[];
  private _presets!: IPreset[];
  private _pluginApi!: PluginApi;
  private _phase: IPhase;
  private extraServerMiddlewares: Runtime.IServerMiddleware[] = [];

  constructor({ cwd, mode, config, configFile, phase }: IApiOPtions) {
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

    if (phase) {
      this._phase = phase;
    } else {
      if (this._mode === 'development') {
        this._phase = 'PHASE_DEVELOPMENT_SERVER';
      } else {
        this._phase = 'PHASE_PRODUCTION_SERVER';
      }
    }
  }

  get mode() {
    return this._mode;
  }

  get phase() {
    return this._phase;
  }

  get config() {
    return this._config;
  }

  get paths() {
    return this._paths;
  }

  async init() {
    this._projectBuilder = new ProjectBuilder({
      static: this.mode === 'production'
    });
    const configFromFile = await loadConfig({
      rootDir: this._cwd,
      configFile: this._configFile,
      overrides: this._userConfig
    });
    this._config = deepmerge(defaultConfig, configFromFile);

    await this._initPresetsAndPlugins();

    initCoreResource(this);

    // TODO?: move into application
    if (typeof this._config.runtimeConfig === 'object') {
      setRuntimeConfig(this._config.runtimeConfig);
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

  get clientManifest(): Bundler.IManifest {
    return this._resources.clientManifest;
  }

  setViewModule(path: string) {
    this._projectBuilder.setViewModule(path);
  }

  setAppModule(module: string | string[]) {
    this._projectBuilder.setAppModule(module);
  }

  setPluginModule(module: string | string[]) {
    this._projectBuilder.setPluginModule(module);
  }

  async setRoutes(routes: IUserRouteConfig[]) {
    routes = await this.callHook<APIHooks.IHookAppRoutes>({
      name: 'app:routes',
      initialValue: routes
    });

    routes = normalizeRoutes(routes, {
      componentDir: this.paths.pagesDir
    });
    routes.push({
      path: ':other(.*)',
      component: this.resolveAppFile('core', '404'),
      name: ROUTE_NOT_FOUND_NAME
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
    this._projectBuilder.setRoutesContent(content);
  }

  getRoutes() {
    return this._routes;
  }

  async buildApp(): Promise<void> {
    await setupApp(this);
    await this._projectBuilder.build(this.paths.appDir);
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

  setEntryFileContent(content: string): void {
    this._projectBuilder.setEntryFileContent(content);
  }

  addEntryCode(content: string): void {
    this._projectBuilder.addEntryCode(content);
  }

  addAppFile(options: FileOptions): void {
    this._projectBuilder.addFile(options);
  }

  addAppExport(source: string, exported: string): void {
    this._projectBuilder.addExport(source, exported);
  }

  addAppPolyfill(file: string): void {
    this._projectBuilder.addPolyfill(file);
  }

  addRuntimePlugin(name: string, runtimePlugin: string): void {
    this._projectBuilder.addRuntimePlugin(name, runtimePlugin);
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

  async destory() {
    if (this._server) {
      await this._server.close();
    }
    await this._projectBuilder.stopBuild();
    await this.callHook<APIHooks.IHookDestroy>('destroy');
  }

  getPluginApi(): PluginApi {
    if (!this._pluginApi) {
      this._pluginApi = createPluginApi(this);
    }

    return this._pluginApi;
  }

  private async _initPresetsAndPlugins() {
    const { phase, _config: config } = this;
    // init presets
    this._presets = resolvePresets(config.presets || [], {
      dir: config.rootDir
    });
    for (const preset of this._presets) {
      this._initPreset(preset);
    }

    // init plugins
    this._plugins = resolvePlugins(this._config.plugins || [], {
      dir: this._config.rootDir
    });
    const allPlugins = this._presetPlugins.concat(this._plugins);

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

    for (const plugin of allPlugins) {
      const pluginInst = plugin.get();
      if (typeof pluginInst.modifyConfig === 'function') {
        this.tap<APIHooks.IHookGetConfig>('getConfig', {
          name: 'pluginModifyConfig',
          fn(config) {
            pluginInst.modifyConfig!(config, phase);
            return config;
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

    // Runtime installation need to be executed before initializing presets and plugins
    // to make sure shuvi entry file at the top.
    coreRuntime.install(this.getPluginApi());
    runtime.install(this.getPluginApi());
    runPlugins();
  }

  private _initPreset(preset: IPreset) {
    const { id, get: getPreset } = preset;
    const { presets, plugins } = getPreset()(this.getPluginApi());

    if (presets) {
      invariant(
        Array.isArray(presets),
        `presets returned from preset ${id} must be Array.`
      );

      const resolvedPresets = resolvePresets(presets, {
        dir: this._config.rootDir
      });

      for (const preset of resolvedPresets) {
        this._initPreset(preset);
      }
    }

    if (plugins) {
      invariant(
        Array.isArray(plugins),
        `presets returned from preset ${id} must be Array.`
      );

      this._presetPlugins.push(
        ...resolvePlugins(plugins, {
          dir: this._config.rootDir
        })
      );
    }
  }

  addServerMiddleware(middleware: Runtime.IServerMiddleware) {
    this.extraServerMiddlewares.push(middleware);
  }

  getServerMiddlewares(): Runtime.IServerMiddlewareItem[] {
    const {
      extraServerMiddlewares,
      paths: { rootDir }
    } = this;

    let serverMiddleware: Runtime.IServerMiddleware[];
    try {
      // this.resources.server maybe don't exist
      serverMiddleware = this.resources.server.server.serverMiddleware || [];
    } catch (error) {
      serverMiddleware = [];
    }

    return [...serverMiddleware, ...extraServerMiddlewares]
      .map(m => normalizeServerMiddleware(m, { rootDir }))
      .sort((a, b) => a.order - b.order);
  }
}

export type { Api };

export async function getApi({
  cwd,
  mode,
  config,
  configFile,
  phase
}: IApiOPtions): Promise<Api> {
  const api = new Api({ cwd, mode, config, configFile, phase });

  await api.init();
  return api;
}
