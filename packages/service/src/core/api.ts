import { isPluginInstance } from '@shuvi/hook/lib/hookGroup';
import { joinPath } from '@shuvi/utils/lib/string';
import rimraf from 'rimraf';
import path from 'path';
import {
  UserConfig,
  Config,
  IPaths,
  IShuviMode,
  IPhase,
  IPlatform,
  IPlatformContent,
  IPluginContext,
  RuntimePluginConfig,
  ResolvedPlugin
} from './apiTypes';
import { createFile, fileUtils, ProjectBuilder, FileOptions } from '../project';
import { PUBLIC_PATH } from '../constants';
import { resolveConfig } from './config';
import {
  getManager,
  PluginManager,
  Resources,
  CorePluginInstance
} from './lifecycle';
import { setupApp } from './setupApp';
import { getPaths } from './paths';
import { getPlugins, resolvePlugin } from './getPlugins';
import { ServerPluginInstance } from '../server';
import { _setResourceEnv } from '../resources';

const ServiceModes: IShuviMode[] = ['development', 'production'];

interface IApiOPtions {
  cwd: string;
  mode: IShuviMode;
  config?: UserConfig;
  phase: IPhase;
  platform?: IPlatform;
}

interface ServerConfigs {
  serverPlugins: ServerPluginInstance[];
  getMiddlewares: IPlatformContent['getMiddlewares'];
  getMiddlewaresBeforeDevMiddlewares: IPlatformContent['getMiddlewaresBeforeDevMiddlewares'];
}

class Api {
  private _cwd: string;
  private _mode: IShuviMode;
  private _phase: IPhase;
  private _userConfig: UserConfig;
  private _config!: Config;
  private _paths!: IPaths;
  private _projectBuilder!: ProjectBuilder;
  private _platform?: IPlatform;
  private _pluginContext!: IPluginContext;
  private _serverPlugins: ServerPluginInstance[] = [];
  private _runtimePlugins: RuntimePluginConfig[] = [];

  pluginManager: PluginManager;
  serverConfigs!: ServerConfigs;

  constructor({ cwd, mode, config, phase, platform }: IApiOPtions) {
    this._cwd = cwd;
    this._mode = mode;
    this._phase = phase;
    this._platform = platform;
    this._userConfig = config || {};
    this.pluginManager = getManager();
    this.pluginManager.clear();
    this._projectBuilder = new ProjectBuilder({
      static: this.mode === 'production'
    });
  }

  get cwd() {
    return this._cwd;
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

  get pluginContext() {
    return this._pluginContext;
  }

  get platform() {
    return this._platform;
  }

  get serverPlugins() {
    return this._serverPlugins;
  }

  get runtimePlugins() {
    return this._runtimePlugins;
  }

  async init() {
    const config = (this._config = resolveConfig(this._userConfig));

    this._paths = getPaths({
      rootDir: this._cwd,
      outputPath: config.outputPath,
      publicDir: config.publicDir
    });
    Object.freeze(this._config);
    Object.freeze(this._paths);

    _setResourceEnv(this.mode === 'production', this.paths.resources);

    this._pluginContext = {
      mode: this._mode,
      paths: this._paths,
      config: this._config,
      phase: this._phase,
      pluginRunner: this.pluginManager.runner,
      assetPublicPath: this.assetPublicPath,
      getAssetPublicUrl: this.getAssetPublicUrl.bind(this),
      resolveAppFile: this.resolveAppFile.bind(this),
      resolveUserFile: this.resolveUserFile.bind(this),
      resolveBuildFile: this.resolveBuildFile.bind(this),
      resolvePublicFile: this.resolvePublicFile.bind(this)
    };

    const { runner, setContext } = this.pluginManager;
    setContext(this._pluginContext);

    // init plugins
    // 1. platform
    // 2. user
    await this.initPlatformPlugins();
    const allPlugins = await getPlugins(this._cwd, config);
    allPlugins.forEach(plugin => this.applyPlugin(plugin));
    await runner.afterInit();
    this.addRuntimePlugin(...this.runtimePlugins);
    const resources = (await runner.addResource()).flat() as Resources[];
    resources.forEach(([key, requireStr]) => {
      this.addResources(key, requireStr);
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

  applyPlugin(plugin: ResolvedPlugin): void {
    const { core, server, runtime } = plugin;
    const { usePlugin } = this.pluginManager;
    if (core) {
      usePlugin(core);
    }
    if (server) {
      this._serverPlugins.push(server);
    }
    if (runtime) {
      this._runtimePlugins.push(runtime);
    }
  }

  async initPlatformPlugins() {
    if (!this.platform) return;
    const platformConfig = this._config.platform;
    const platformContent = await this.platform(platformConfig, {
      serverPlugins: this.serverPlugins
    });
    const { getMiddlewares, getMiddlewaresBeforeDevMiddlewares, plugins } =
      platformContent;
    this.serverConfigs = {
      serverPlugins: this.serverPlugins,
      getMiddlewares,
      getMiddlewaresBeforeDevMiddlewares
    };
    const { usePlugin, createPlugin } = this.pluginManager;
    if (plugins) {
      plugins.forEach(plugin => {
        if (typeof plugin === 'string') {
          this.applyPlugin(resolvePlugin(plugin));
        } else if (isPluginInstance(plugin)) {
          this.applyPlugin({ core: plugin as CorePluginInstance });
        } else {
          this.applyPlugin(plugin as ResolvedPlugin);
        }
      });
    }
    usePlugin(
      createPlugin({
        afterInit: async context => {
          const internalRuntimeFiles =
            await platformContent.getInternalRuntimeFiles(context);
          internalRuntimeFiles.forEach(file => {
            this.addInternalRuntimeFile(file);
          });
        }
      })
    );
  }

  async initProjectBuilderConfigs() {
    const runner = this.pluginManager.runner;
    const addRuntimeFileUtils = {
      createFile,
      getAllFiles: fileUtils.getAllFiles
    };
    const appRuntimeFiles = (
      await runner.addRuntimeFile(addRuntimeFileUtils)
    ).flat();
    const runtimeServices = (await runner.addRuntimeService()).flat();

    appRuntimeFiles.forEach(options => {
      this.addRuntimeFile(options);
    });

    runtimeServices.forEach(({ source, exported, filepath }) => {
      this.addRuntimeService(source, exported, filepath);
    });
  }

  removeBuiltFiles() {
    rimraf.sync(this.paths.appDir);
    rimraf.sync(this.paths.buildDir);
  }

  async buildApp(): Promise<void> {
    await setupApp(this);
    this.removeBuiltFiles();
    await this._projectBuilder.build(this.paths.privateDir);
  }

  addRuntimeFile(options: FileOptions): void {
    // make addAppFile root as .shuvi/app/files/
    options.name = path.join('app', 'files', path.resolve('/', options.name));
    this._projectBuilder.addFile(options);
  }

  addInternalRuntimeFile(options: FileOptions): void {
    this._projectBuilder.addFile(options);
  }

  addRuntimePlugin(...plugins: RuntimePluginConfig[]): void {
    this._projectBuilder.addRuntimePlugin(...plugins);
  }

  addRuntimeService(source: string, exported: string, filepath?: string): void {
    this._projectBuilder.addRuntimeService(source, exported, filepath);
  }

  addResources(key: string, requireStr?: string): void {
    this._projectBuilder.addResources(key, requireStr);
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
    await this.pluginManager.runner.afterDestroy();
  }
}

export { Api };

export async function getApi(options: Partial<IApiOPtions>): Promise<Api> {
  const cwd = path.resolve(options.cwd || '.');
  let mode = options.mode;
  if (ServiceModes.includes((mode || process.env.NODE_ENV) as any)) {
    mode = (mode || process.env.NODE_ENV) as IShuviMode;
  } else {
    mode = 'production';
  }

  let phase = options.phase;
  if (!phase) {
    if (mode === 'development') {
      phase = 'PHASE_DEVELOPMENT_SERVER';
    } else {
      phase = 'PHASE_PRODUCTION_SERVER';
    }
  }

  const api = new Api({
    cwd,
    mode,
    phase,
    config: options.config,
    platform: options.platform
  });

  await api.init();
  return api;
}
