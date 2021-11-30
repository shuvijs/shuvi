import path from 'path';
import WebpackChain from 'webpack-chain';
import {
  IApiConfig,
  IConfig,
  IApi,
  IApiRouteConfig,
  IMiddlewareRouteConfig,
  IUserRouteConfig,
  IPaths,
  IShuviMode,
  IPhase
} from './types';
import * as Bundler from '@shuvi/toolpack/lib/webpack/types';
import * as APIHooks from '../types/hooks';
import { IRuntime } from '../types/index';
import { IServerMiddlewareItem } from '../types/server';
import {
  IServerMiddleware,
  IServerMiddlewareOptions,
  normalizeServerMiddleware
} from './serverMiddleware';
import {
  ProjectBuilder,
  UserModule,
  TargetModule,
  FileOptions,
  fileSnippets
} from '../project';
import { joinPath } from '@shuvi/utils/lib/string';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import invariant from '@shuvi/utils/lib/invariant';
import { Hookable } from '@shuvi/hook';
import { serializeRoutes, normalizeRoutes } from '../lib/routes';
import { serializeApiRoutes, normalizeApiRoutes } from '../lib/apiRoutes';
import { normalizeMiddlewareRoutes, serializeMiddlewareRoutes } from '../lib/middlewaresRoutes';
import { PUBLIC_PATH } from '../constants';
import { createDefaultConfig, loadConfig } from '../config';
import { IResources, IPlugin, IPreset } from './types';
import { Server } from '../server';
import { setupApp } from './setupApp';
import { resolvePlugins, resolvePresets } from './plugin';
import { createPluginApi, PluginApi } from './pluginApi';
import { getPaths } from './paths';
import rimraf from 'rimraf';
import getPlatform from '../lib/getPlatform';
import { IWebpackHelpers } from '@shuvi/toolpack/lib/webpack/types';

const ServiceModes: IShuviMode[] = ['development', 'production'];

interface IApiOPtions {
  cwd?: string;
  mode?: IShuviMode;
  config?: IConfig;
  configFile?: string;
  phase?: IPhase;
}

interface IChain {
  chain: WebpackChain;
  name: string;
  mode: IShuviMode;
  helpers: IWebpackHelpers;
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
  private _webpackChains: IChain[] = [];
  private _presets!: IPreset[];
  private _pluginApi!: PluginApi;
  private _phase: IPhase;
  private _beforePageMiddlewares: IServerMiddleware[] = [];
  private _afterPageMiddlewares: IServerMiddleware[] = [];
  private _platform!: IRuntime;
  helpers: IApi['helpers'];

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
    this.helpers = { fileSnippets };
    if (phase) {
      this._phase = phase;
    } else {
      if (this._mode === 'development') {
        this._phase = 'PHASE_DEVELOPMENT_SERVER';
      } else {
        this._phase = 'PHASE_PRODUCTION_SERVER';
      }
    }
    this.initConfig();
    this._platform = getPlatform(this.config.platform.name);
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

  get platform() {
    return this._platform;
  }

  initConfig() {
    const configFromFile = loadConfig({
      rootDir: this._cwd,
      configFile: this._configFile,
      overrides: this._userConfig
    });
    this._config = deepmerge(createDefaultConfig(), configFromFile);
    const {
      ssr,
      router: { history }
    } = this._config;
    // ensure apiRouteConfigPrefix starts with '/'
    const apiRouteConfigPrefix = this._config.apiConfig!.prefix;
    if (apiRouteConfigPrefix) {
      this._config.apiConfig!.prefix = path.resolve('/', apiRouteConfigPrefix);
    }
    // set history to a specific value
    if (history === 'auto') {
      this._config.router.history = ssr ? 'browser' : 'hash';
    }
  }

  async init() {
    this._projectBuilder = new ProjectBuilder({
      static: this.mode === 'production'
    });

    const runPluginsHandler = await this._initPresetsAndPlugins();

    // prepare all properties befofre run plugins, so plugin can use all api of Api
    this._config = await this.callHook<APIHooks.IHookGetConfig>({
      name: 'getConfig',
      initialValue: this.config
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
    await this.platform.install(this);

    runPluginsHandler();
  }

  get server() {
    if (!this._server) {
      this._server = new Server();
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

  get resources(): IResources {
    return this._resources;
  }

  // TODO: move to platform
  get clientManifest(): Bundler.IManifest {
    return this._resources.clientManifest;
  }

  getBuildTargets() {
    return this._webpackChains;
  }

  addBuildTargets(chain: IChain) {
    this._webpackChains.push(chain);
  }

  addServerMiddleware(middleware: IServerMiddleware) {
    this._beforePageMiddlewares.push(middleware);
  }

  getBeforePageMiddlewares(): IServerMiddlewareItem[] {
    const {
      _beforePageMiddlewares,
      paths: { rootDir }
    } = this;

    let serverMiddleware: IServerMiddlewareOptions[];
    try {
      // this.resources.server maybe don't exist
      serverMiddleware = this.resources.server.server.serverMiddleware || [];
    } catch (error) {
      serverMiddleware = [];
    }

    return [...serverMiddleware, ..._beforePageMiddlewares]
      .map(m => normalizeServerMiddleware(m, { rootDir }))
      .sort((a, b) => a.order - b.order);
  }

  addServerMiddlewareLast(middleware: IServerMiddleware) {
    this._afterPageMiddlewares.push(middleware);
  }

  getAfterPageMiddlewares(): IServerMiddlewareItem[] {
    const {
      _afterPageMiddlewares,
      paths: { rootDir }
    } = this;

    return [..._afterPageMiddlewares]
      .map(m => normalizeServerMiddleware(m, { rootDir }))
      .sort((a, b) => a.order - b.order);
  }

  setRuntimeConfigContent(content: string | null) {
    this._projectBuilder.setRuntimeConfigContent(content);
  }

  setUserModule(userModule: Partial<UserModule>) {
    this._projectBuilder.setUserModule(userModule);
  }

  setPlatformModule(module: string) {
    this._projectBuilder.setPlatformModule(module);
  }

  async setRoutes(routes: IUserRouteConfig[]): Promise<void> {
    routes = await this.callHook<APIHooks.IHookAppRoutes>({
      name: 'app:routes',
      initialValue: routes
    });

    routes = normalizeRoutes(routes, {
      componentDir: this.paths.pagesDir
    });

    this._routes = routes;
    const serialized = serializeRoutes(routes);
    const RoutesContent = `export default ${serialized}`;
    this._projectBuilder.setRoutesContent(RoutesContent);
  }

  getRoutes() {
    return this._routes;
  }

  async setApiRoutes(apiRoutes: IApiRouteConfig[]): Promise<void> {
    apiRoutes = normalizeApiRoutes(apiRoutes, {
      apisDir: this.paths.apisDir
    });

    const { prefix } = this.config.apiConfig || {};

    const serialized = serializeApiRoutes(apiRoutes, prefix);

    let content = `export default ${serialized}`;
    this._projectBuilder.setApiRoutesContent(content);
  }

  async setMiddlewaresRoutes(middlewaresRoutes: IMiddlewareRouteConfig[]): Promise<void> {
    middlewaresRoutes = normalizeMiddlewareRoutes(middlewaresRoutes, {
      pagesDir: this.paths.pagesDir
    });

    const serialized = serializeMiddlewareRoutes(middlewaresRoutes);

    let content = `export default ${serialized}`;
    this._projectBuilder.setMiddlewareRoutesContent(content);
  }

  removeBuiltFiles() {
    rimraf.sync(this.paths.appDir);
    rimraf.sync(this.paths.buildDir);
  }

  async buildApp(): Promise<void> {
    await setupApp(this);
    this.removeBuiltFiles();
    this._projectBuilder.validateCompleteness('api');
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

  addEntryCode(content: string): void {
    this._projectBuilder.addEntryCode(content);
  }

  setEntryWrapperContent(content: string) {
    this._projectBuilder.setEntryWrapperContent(content);
  }

  addAppFile(options: FileOptions): void {
    // make addAppFile root as files/
    options.name = path.join('files', path.resolve('/', options.name));
    this._projectBuilder.addFile(options);
  }

  addAppExport(source: string, exported: string): void {
    this._projectBuilder.addExport(source, exported);
  }

  addAppService(source: string, exported: string, filepath: string): void {
    // make addAppService root as services/
    const targetPath = path.join('services', path.resolve('/', filepath));
    this._projectBuilder.addService(source, exported, targetPath);
  }

  addAppPolyfill(file: string): void {
    this._projectBuilder.addPolyfill(file);
  }

  setClientModule(module: TargetModule) {
    this._projectBuilder.setClientModule(module);
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

    return runPlugins;
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
}

export { Api };

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
