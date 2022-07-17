import { isPluginInstance } from '@shuvi/hook/lib/hookGroup';
import { joinPath } from '@shuvi/utils/lib/string';
import rimraf from 'rimraf';
import * as path from 'path';
import {
  Config,
  NormalizedConfig,
  IPaths,
  IShuviMode,
  IPhase,
  IPlatform,
  IPlatformContent,
  IPluginContext,
  RuntimePluginConfig,
  ResolvedPlugin
} from './apiTypes';
import { defineFile, ProjectBuilder, FileOptions } from '../project';
import { DEFAULT_PUBLIC_PATH } from '../constants';
import { resolveConfig } from './config';
import {
  getManager,
  PluginManager,
  Resources,
  CorePluginInstance
} from './lifecycle';
import { getPaths } from './paths';
import { getPlugins, resolvePlugin } from './getPlugins';
import { ServerPluginInstance } from '../server';
import { _setResourceEnv } from '../resources';

const ServiceModes: IShuviMode[] = ['development', 'production'];

interface IApiOPtions {
  cwd: string;
  mode: IShuviMode;
  config?: Config;
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
  private _userConfig: Config;
  private _config!: NormalizedConfig;
  private _paths!: IPaths;
  private _projectBuilder!: ProjectBuilder;
  private _platform?: IPlatform;
  private _serverPlugins: ServerPluginInstance[] = [];
  private _pluginManager: PluginManager;
  private _pluginContext!: IPluginContext;
  private _serverConfigs!: ServerConfigs;

  /** will be included by @shuvi/swc-loader */
  private _runtimePluginDirs: string[] = [];

  constructor({ cwd, mode, config, phase, platform }: IApiOPtions) {
    this._cwd = cwd;
    this._mode = mode;
    this._phase = phase;
    this._platform = platform;
    this._userConfig = config || {};
    this._pluginManager = getManager();
    this._pluginManager.clear();
    this._projectBuilder = new ProjectBuilder({
      static: this._mode === 'production'
    });
  }

  get cwd() {
    return this._cwd;
  }

  get mode() {
    return this._mode;
  }

  get pluginManager() {
    return this._pluginManager;
  }

  get pluginContext() {
    return this._pluginContext;
  }

  get serverConfigs() {
    return this._serverConfigs;
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

    _setResourceEnv(this._mode === 'production', this._paths.resources);

    this._pluginContext = {
      mode: this._mode,
      paths: this._paths,
      config: this._config,
      phase: this._phase,
      pluginRunner: this._pluginManager.runner,
      assetPublicPath: this.assetPublicPath,
      getAssetPublicUrl: this.getAssetPublicUrl.bind(this),
      resolveAppFile: this.resolveAppFile.bind(this),
      resolveUserFile: this.resolveUserFile.bind(this),
      resolveBuildFile: this.resolveBuildFile.bind(this),
      resolvePublicFile: this.resolvePublicFile.bind(this)
    };

    const { runner, setContext, createPlugin, usePlugin } = this._pluginManager;
    setContext(this._pluginContext);

    //## start init
    // 1. init platform
    const { plugins: platformPlugins, getPresetRuntimeFiles } =
      await this._initPlatform();

    // 2. init user plugins
    const userPlugins = await getPlugins(this._cwd, config);
    platformPlugins
      .concat(userPlugins)
      .forEach(plugin => this._applyPlugin(plugin));

    // include runtimePlugin directories at @shuvi/swc-loader
    const addIncludeToSwcLoader = createPlugin({
      configWebpack: config => {
        config.module
          .rule('main')
          .oneOf('js')
          .include.merge(this._runtimePluginDirs);
        return config;
      }
    });
    usePlugin(addIncludeToSwcLoader);

    // 3. init resources
    const resources = (await runner.addResource()).flat() as Resources[];
    resources.forEach(([key, requireStr]) => {
      this.addResources(key, requireStr);
    });

    //## end init
    const extendedConfig = runner.extendConfig(
      this._config
    ) as NormalizedConfig;
    const newConfig = resolveConfig(extendedConfig, [this._userConfig]);
    this._pluginContext.config = newConfig;
    setContext(this._pluginContext);
    await runner.afterInit();

    // getPresetRuntimeFiles might call pluginRunner，so call it after
    // "afterInit" hook.
    const platformPresetRuntimeFiles = await getPresetRuntimeFiles();
    platformPresetRuntimeFiles.forEach(file => {
      this.addInternalRuntimeFile(file);
    });
  }

  get assetPublicPath(): string {
    let publicPath = this._config.publicPath || DEFAULT_PUBLIC_PATH;

    if (!publicPath.endsWith('/')) {
      publicPath += '/';
    }

    return publicPath;
  }

  async buildApp(): Promise<void> {
    await Promise.all([this._removeLastArtifacts(), this._initArtifacts()]);
    await this._projectBuilder.build(this._paths.privateDir);
  }

  addRuntimeFile(options: FileOptions): void {
    // modify options.name to make addAppFile root as .shuvi/app/files/
    options.name = path.join('app', 'files', path.resolve('/', options.name));
    this._projectBuilder.addFile(options);
  }

  addInternalRuntimeFile(options: FileOptions): void {
    this._projectBuilder.addFile(options);
  }

  addRuntimePlugin(plugin: RuntimePluginConfig): void {
    this._projectBuilder.addRuntimePlugin(plugin);
  }

  addRuntimeService(source: string, exported: string, filepath?: string): void {
    this._projectBuilder.addRuntimeService(source, exported, filepath);
  }

  addRuntimeTypesPatch(file: string): void {
    this._projectBuilder.addTypeDeclarationFile(file);
  }

  addResources(key: string, requireStr?: string): void {
    this._projectBuilder.addResources(key, requireStr);
  }

  getAssetPublicUrl(...paths: string[]): string {
    return joinPath(this.assetPublicPath, ...paths);
  }

  resolveAppFile(...paths: string[]): string {
    return joinPath(this._paths.appDir, ...paths);
  }

  resolveUserFile(...paths: string[]): string {
    return joinPath(this._paths.srcDir, ...paths);
  }

  resolveBuildFile(...paths: string[]): string {
    return joinPath(this._paths.buildDir, ...paths);
  }

  resolvePublicFile(...paths: string[]): string {
    return joinPath(this._paths.publicDir, ...paths);
  }

  async destory() {
    await this._projectBuilder.stopBuild();
    await this._pluginManager.runner.afterDestroy();
  }

  private _applyPlugin(plugin: ResolvedPlugin): void {
    const { core, server, runtime, types } = plugin;
    const { usePlugin } = this._pluginManager;
    if (core) {
      usePlugin(core);
    }
    if (server) {
      this._serverPlugins.push(server);
    }
    if (runtime) {
      this.addRuntimePlugin(runtime);
      this._runtimePluginDirs.push(path.dirname(runtime.plugin));
    }
    if (types) {
      this.addRuntimeTypesPatch(types);
    }
  }

  private async _initPlatform(): Promise<{
    plugins: ResolvedPlugin[];
    getPresetRuntimeFiles: () => Promise<FileOptions[]> | FileOptions[];
  }> {
    if (!this._platform)
      return {
        plugins: [],
        getPresetRuntimeFiles: () => []
      };

    const platformConfig = this._config.platform;
    const platformContent = await this._platform(platformConfig, {
      serverPlugins: this._serverPlugins
    });
    const {
      types,
      getMiddlewares,
      getMiddlewaresBeforeDevMiddlewares,
      plugins
    } = platformContent;
    this._serverConfigs = {
      serverPlugins: this._serverPlugins,
      getMiddlewares,
      getMiddlewaresBeforeDevMiddlewares
    };
    let resolvedPlugins: ResolvedPlugin[] = [];
    if (plugins) {
      plugins.forEach(plugin => {
        if (typeof plugin === 'string') {
          resolvedPlugins.push(resolvePlugin(plugin));
        } else if (isPluginInstance(plugin)) {
          resolvedPlugins.push({ core: plugin as CorePluginInstance });
        } else {
          resolvedPlugins.push(plugin as ResolvedPlugin);
        }
      });
    }

    if (types) {
      ([] as string[]).concat(types).forEach(type => {
        this.addRuntimeTypesPatch(type);
      });
    }

    return {
      plugins: resolvedPlugins,
      getPresetRuntimeFiles: () =>
        platformContent.getPresetRuntimeFiles(this._pluginContext)
    };
  }

  private async _initArtifacts() {
    const runner = this._pluginManager.runner;
    const addRuntimeFileUtils = {
      defineFile,
      getContent: this._projectBuilder.getContentGetter()
    };
    const [appRuntimeFiles, runtimeServices] = await Promise.all([
      (await runner.addRuntimeFile(addRuntimeFileUtils)).flat(),
      (await runner.addRuntimeService()).flat()
    ]);

    appRuntimeFiles.forEach(options => {
      this.addRuntimeFile(options);
    });
    runtimeServices.forEach(({ source, exported, filepath }) => {
      this.addRuntimeService(source, exported, filepath);
    });
  }

  private _removeLastArtifacts() {
    return new Promise<void>(resolve => {
      let i = 0;
      const done = () => {
        if (++i === 2) {
          resolve();
        }
      };
      rimraf(this._paths.appDir, done);
      rimraf(this._paths.buildDir, done);
    });
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
