import {
  IConfig,
  IApi,
  ICallHookOpts,
  IHookConfig,
  IHookOpts,
  IEventAppReady,
  IHookAppRoutes,
  IHookAppRoutesFile,
  IHookDestory,
  ISpecifier,
  IPaths,
  IShuviMode,
} from '@shuvi/types';
import { App, IRouteConfig, IFile } from '@shuvi/core';
import { genRouteId } from '@shuvi/shared/lib/router';
import { joinPath } from '@shuvi/utils/lib/string';
import { Hooks } from '../lib/hooks';
import { setRuntimeConfig } from '../lib/runtimeConfig';
import { serializeRoutes } from '../lib/serializeRoutes';
import { PUBLIC_PATH } from '../constants';
import { IResources, IBuiltResource, IPlugin } from './types';
import { Server } from '../server';
import { setupApp } from './setupApp';
import { initCoreResource } from './initCoreResource';
import { resolvePlugins } from './plugin';
import { createPluginApi, PluginApi } from './pluginApi';
import { getPaths } from './paths';

const ServiceModes: IShuviMode[] = ['development', 'production'];

export class Api implements IApi {
  mode: IShuviMode;
  paths: IPaths;
  config: IConfig;

  private _hooks: Hooks;
  private _app: App;
  private _server!: Server;
  private _resources: IResources = {} as IResources;
  private _plugins: IPlugin[];
  private _pluginApi!: PluginApi;

  constructor({ mode, config }: { mode?: IShuviMode; config: IConfig }) {
    if (mode) {
      this.mode = mode;
    } else if (ServiceModes.includes(process.env.NODE_ENV as any)) {
      this.mode = process.env.NODE_ENV as any;
    } else {
      this.mode = 'production';
    }
    this.config = config;
    this.paths = getPaths({
      rootDir: config.rootDir,
      outputPath: config.outputPath,
    });

    this._hooks = new Hooks();
    this._app = new App();
    this._plugins = resolvePlugins(config.plugins || []);
    this._plugins.forEach((plugin) => plugin.get()(this.getPluginApi()));

    initCoreResource(this);

    if (typeof config.runtimeConfig === 'object') {
      setRuntimeConfig(config.runtimeConfig);
    }
  }

  get server() {
    if (!this._server) {
      this._server = new Server({
        proxy: this.config.proxy,
      });
    }

    return this._server;
  }

  get assetPublicPath(): string {
    let prefix =
      this.mode === 'development' ? PUBLIC_PATH : this.config.publicPath;

    if (!prefix.endsWith('/')) {
      prefix += '/';
    }

    return prefix;
  }

  get resources(): IBuiltResource {
    return this._resources;
  }

  tap<Config extends IHookConfig>(
    hook: Config['name'],
    opts: IHookOpts<Config['initialValue'], Config['args']>
  ) {
    this._hooks.addHook(hook, opts);
  }
  async callHook<Config extends IHookConfig>(
    name: Config['name'],
    ...args: Config['args']
  ): Promise<void>;
  async callHook<Config extends IHookConfig>(
    options: ICallHookOpts<Config['name'], Config['initialValue']>,
    ...args: Config['args']
  ): Promise<Config['initialValue']>;
  // implement
  async callHook(options: string | ICallHookOpts<string>, ...args: any[]) {
    return this._hooks.callHook(options as any, ...args);
  }

  on<Config extends IHookConfig>(
    event: Config['name'],
    listener: (...args: Config['args']) => void
  ) {
    this._hooks.addHook(event, { name: 'listener', fn: listener });
  }
  emitEvent<Config extends IHookConfig>(
    name: Config['name'],
    ...args: Config['args']
  ): void {
    this._hooks.callHook({ name, parallel: true }, ...args);
  }

  setBootstrapModule(path: string) {
    this._app.setBootstrapModule(path);
  }

  setAppModule(module: string | string[]) {
    this._app.setAppModule(module);
  }

  async setRoutes(routes: IRouteConfig[]) {
    // add fallback route
    routes.push({
      id: genRouteId('404'),
      componentFile: this.resolveAppFile('core', '404'),
    });

    routes = await this.callHook<IHookAppRoutes>({
      name: 'app:routes',
      initialValue: routes,
    });
    let content = `export default ${serializeRoutes(routes)}`;
    content = await this.callHook<IHookAppRoutesFile>({
      name: 'app:routes-file',
      initialValue: content,
    });
    this._app.setRoutesContent(content);
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
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    this.emitEvent<IEventAppReady>('app:ready');
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
            writable: false,
          });
          return value;
        },
        enumerable: true,
        configurable: true,
      });
    } else {
      Object.defineProperty(this._resources, identifier, {
        get() {
          return loader();
        },
        enumerable: true,
        configurable: true,
      });
    }
  }

  addAppFile(file: IFile, dir = ''): void {
    this._app.addFile(file, dir.startsWith('/') ? dir : `/${dir}`);
  }

  addAppExport(
    source: string,
    specifier: ISpecifier | ISpecifier[] | true
  ): void {
    this._app.addExport(source, specifier);
  }

  addAppPolyfill(file: string): void {
    this._app.addPolyfill(file);
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
      this._server.close();
    }
    this._app.stopBuild(this.paths.appDir);
    await this.callHook<IHookDestory>('destory');
  }
}
