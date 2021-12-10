import path from 'path';
import {
  IApiConfig,
  IConfig,
  IApi,
  IApiRouteConfig,
  IMiddlewareRouteConfig,
  IUserRouteConfig,
  IPaths,
  IShuviMode,
  IPhase,
  IRuntimeOrServerPlugin
} from './types';
import { IPlatform } from '../types/index';
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
import { serializeRoutes, normalizeRoutes } from '../lib/routes';
import { serializeApiRoutes, normalizeApiRoutes } from '../lib/apiRoutes';
import {
  normalizeMiddlewareRoutes,
  serializeMiddlewareRoutes
} from '../lib/middlewaresRoutes';
import { PUBLIC_PATH } from '../constants';
import { createDefaultConfig, loadConfig } from '../config';
import { IResources, IPreset, ICliContext } from './types';
import {
  ICliPluginInstance as IPlugin,
  getManager,
  PluginManager
} from './cliHooks';
import { setupApp } from './setupApp';
import { resolvePlugins, resolvePresets } from './plugin';
import { getPaths } from './paths';
import rimraf from 'rimraf';
import getPlatform from '../lib/getPlatform';

const ServiceModes: IShuviMode[] = ['development', 'production'];

interface IApiOPtions {
  cwd?: string;
  mode?: IShuviMode;
  config?: IConfig;
  configFile?: string;
  phase?: IPhase;
}

class Api implements IApi {
  private _cwd: string;
  private _mode: IShuviMode;
  private _userConfig?: IConfig;
  private _config!: IApiConfig;
  private _configFile?: string;
  private _paths!: IPaths;
  private _projectBuilder!: ProjectBuilder;
  private _resources: IResources = {} as IResources;
  private _routes: IUserRouteConfig[] = [];
  private _presetPlugins: IPlugin[] = [];
  private _plugins!: IPlugin[];
  private _serverPlugins: IRuntimeOrServerPlugin[] = [];
  private _presets!: IPreset[];
  private _phase: IPhase;
  private _platform!: IPlatform;
  cliContext: ICliContext;
  pluginManager: PluginManager;
  serverPlugins: IRuntimeOrServerPlugin[] = [];

  // todo remove mode

  constructor({ cwd, mode, config, configFile, phase }: IApiOPtions) {
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
    this.pluginManager = getManager();
    this.pluginManager.clear();
    this.initConfig();
    this._platform = getPlatform(this.config.platform.name);
    this.cliContext = {
      mode: this._mode,
      paths: this.paths,
      config: this.config,
      phase: this.phase,
      pluginRunner: this.pluginManager.runner,
      serverPlugins: this.serverPlugins,
      // resources
      resources: this.resources,
      assetPublicPath: this.assetPublicPath,
      getAssetPublicUrl: this.getAssetPublicUrl.bind(this),
      resolveAppFile: this.resolveAppFile.bind(this),
      resolveUserFile: this.resolveUserFile.bind(this),
      resolveBuildFile: this.resolveBuildFile.bind(this),
      resolvePublicFile: this.resolvePublicFile.bind(this),
      getRoutes: this.getRoutes.bind(this)
    };
    this.pluginManager.setContext(this.cliContext);
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

  async initPlatformPlugin() {
    const platformPlugins = await this.platform(this.cliContext);
    this.pluginManager.usePlugin(...platformPlugins);
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
    await this._initPresetsAndPlugins();
    await this.initPlatformPlugin();
    this._config = await this.pluginManager.runner.config(
      this.config,
      this.phase
    );

    Object.freeze(this._config);

    this._paths = getPaths({
      rootDir: this._config.rootDir,
      outputPath: this._config.outputPath,
      publicDir: this._config.publicDir
    });
    // do not allow to modify paths
    Object.freeze(this._paths);
    // need to reset config and paths in cliContext
    this.cliContext.config = this.config;
    this.cliContext.paths = this.paths;
    // must run first so that platform could get serverPlugin
    await this.initRuntimeAndServerPlugin();
    await this.pluginManager.runner.setup();
    const bundleResources = (
      await this.pluginManager.runner.bundleResource()
    ).flat();
    bundleResources.forEach(({ identifier, loader }) => {
      this.addResoure(identifier, loader);
    });
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

  async initProjectBuilderConfigs() {
    const runner = this.pluginManager.runner;
    const appPolyfills = (await runner.appPolyfill()).flat();
    const appFiles = (await runner.appFile(fileSnippets)).flat();
    const appExports = (await runner.appExport()).flat();
    const appEntryCodes = (await runner.appEntryCode()).flat();
    const appServices = (await runner.appService()).flat();
    const platformModule = (await runner.platformModule()) as string;
    const clientModule = (await runner.clientModule()) as TargetModule;
    const userModule = (await runner.userModule()) as UserModule;

    appPolyfills.forEach(file => {
      this.addAppPolyfill(file);
    });

    appFiles.forEach(options => {
      this.addAppFile(options);
    });

    appExports.forEach(({ source, exported }) => {
      this.addAppExport(source, exported);
    });

    appEntryCodes.forEach(content => {
      this.addEntryCode(content);
    });

    appServices.forEach(({ source, exported, filepath }) => {
      this.addAppService(source, exported, filepath);
    });

    this.setPlatformModule(platformModule);
    this.setClientModule(clientModule);
    this.setUserModule(userModule);
  }
  async initRuntimeAndServerPlugin() {
    const normalize = (
      x: string | IRuntimeOrServerPlugin
    ): IRuntimeOrServerPlugin => {
      if (typeof x === 'string') {
        return {
          plugin: x
        };
      }
      return x;
    };
    const serverPlugins: IRuntimeOrServerPlugin[] = (
      await this.pluginManager.runner.serverPlugin()
    )
      .flat()
      .map(normalize);
    const runtimePlugins = (await this.pluginManager.runner.runtimePlugin())
      .flat()
      .map(normalize);
    this.serverPlugins.push(...serverPlugins);
    this.addRuntimePlugin(...runtimePlugins);
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
    routes = await this.pluginManager.runner.appRoutes(routes);

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

  async setMiddlewaresRoutes(
    middlewaresRoutes: IMiddlewareRouteConfig[]
  ): Promise<void> {
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
    this.pluginManager.runner.appReady();
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

  addRuntimePlugin(...plugins: IRuntimeOrServerPlugin[]): void {
    this._projectBuilder.addRuntimePlugin(...plugins);
  }

  addServerPlugin(config: IRuntimeOrServerPlugin) {
    this._serverPlugins.push(config);
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
    await this._projectBuilder.stopBuild();
    await this.pluginManager.runner.destroy();
  }

  private async _initPresetsAndPlugins() {
    const { _config: config } = this;
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
    for (const plugin of allPlugins) {
      this.pluginManager.usePlugin(plugin);
    }
  }

  private _initPreset(preset: IPreset) {
    const { id, get: getPreset } = preset;
    const { presets, plugins } = getPreset()(this.cliContext);

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
