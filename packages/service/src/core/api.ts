import { isPluginInstance } from '@shuvi/hook/lib/hookGroup';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import { joinPath } from '@shuvi/utils/lib/string';
import rimraf from 'rimraf';
import * as path from 'path';
import {
  Config,
  NormalizedConfig,
  IPluginConfig,
  IPresetConfig,
  IPaths,
  IServiceMode,
  IServicePhase,
  IPlatform,
  IPlatformContent,
  IPluginContext,
  RuntimePluginConfig,
  ResolvedPlugin
} from './apiTypes';
import { defineFile, ProjectBuilder, FileOption } from '../project';
import { DEFAULT_PUBLIC_PATH } from '../constants';
import {
  getManager,
  PluginManager,
  Resources,
  CorePluginInstance
} from './lifecycle';
import { getDefaultConfig } from './config';
import { getPaths } from './paths';
import { getPlugins, resolvePlugin } from './getPlugins';
import { ServerPluginInstance } from '../server';
import { _setResourceEnv } from '../resources';

const ServiceModes: IServiceMode[] = ['development', 'production'];

interface IApiOPtions {
  cwd: string;
  mode: IServiceMode;
  phase: IServicePhase;
  config?: Config;
  platform?: IPlatform;
  plugins?: IPluginConfig[];
  presets?: IPresetConfig[];
}

interface ServerConfigs {
  serverPlugins: ServerPluginInstance[];
  getMiddlewares: IPlatformContent['getMiddlewares'];
  getMiddlewaresBeforeDevMiddlewares: IPlatformContent['getMiddlewaresBeforeDevMiddlewares'];
}

class Api {
  private _cwd: string;
  private _mode: IServiceMode;
  private _phase: IServicePhase;
  private _config!: NormalizedConfig;
  private _plugins: IPluginConfig[];
  private _presets: IPresetConfig[];
  private _paths!: IPaths;
  private _projectBuilder!: ProjectBuilder;
  private _platform?: IPlatform;
  private _serverPlugins: ServerPluginInstance[] = [];
  private _pluginManager: PluginManager;
  private _pluginContext!: IPluginContext;
  private _serverConfigs!: ServerConfigs;

  /** will be included by @shuvi/swc-loader */
  private _runtimePluginDirs: string[] = [];

  constructor({
    cwd,
    mode,
    config = {},
    presets,
    plugins,
    phase,
    platform
  }: IApiOPtions) {
    this._cwd = cwd;
    this._mode = mode;
    this._phase = phase;
    this._platform = platform;
    this._config = deepmerge(getDefaultConfig(), config);
    this._presets = presets || [];
    this._plugins = plugins || [];
    this._pluginManager = getManager();
    this._pluginManager.clear();
    this._projectBuilder = new ProjectBuilder();
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
    this._paths = getPaths({
      rootDir: this._cwd,
      outputPath: this._config.outputPath,
      publicDir: this._config.publicDir
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
      resolvePublicFile: this.resolvePublicFile.bind(this),
      onBuildStart: this._projectBuilder.onBuildStart,
      onBuildEnd: this._projectBuilder.onBuildEnd
    };

    const { runner, setContext, createPlugin, usePlugin } = this._pluginManager;
    setContext(this._pluginContext);

    //## start init
    // 1. init platform
    const { plugins: platformPlugins, getPresetRuntimeFiles } =
      await this._initPlatform();

    // 2. init user plugins
    const userPlugins = await getPlugins(this._cwd, {
      presets: this._presets,
      plugins: this._plugins
    });
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
    if (this.mode === 'production') {
      await this._projectBuilder.build(this._paths.privateDir);
    } else {
      await this._projectBuilder.watch(this._paths.privateDir);
    }
  }

  addRuntimeFile(option: FileOption<any>): void {
    if (option.name) {
      option.name = path.join('app', 'files', option.name);
    }
    this._projectBuilder.addFile(option);
  }

  addInternalRuntimeFile(option: FileOption<any>): void {
    this._projectBuilder.addFile(option);
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
    getPresetRuntimeFiles: () => Promise<FileOption<any>[]> | FileOption<any>[];
  }> {
    if (!this._platform)
      return {
        plugins: [],
        getPresetRuntimeFiles: () => []
      };

    const platformContent = await this._platform({
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
      getContent: this._projectBuilder.getContent
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

export async function getApi(options: Partial<IApiOPtions> = {}): Promise<Api> {
  const cwd = path.resolve(options.cwd || '.');
  let mode = options.mode;
  if (ServiceModes.includes((mode || process.env.NODE_ENV) as any)) {
    mode = (mode || process.env.NODE_ENV) as IServiceMode;
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
    platform: options.platform,
    presets: options.presets,
    plugins: options.plugins
  });

  await api.init();
  return api;
}
