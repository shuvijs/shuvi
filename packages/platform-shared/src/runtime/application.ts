import { getManager, PluginManager } from './lifecycle';
import { initPlugins } from './lifecycle';
import { IModelManager } from './store';
import { IRouter } from './routerTypes';
import {
  IApplication,
  IAppContext,
  IApplicationOptions,
  IRerenderConfig
} from './applicationTypes';

export class Application {
  private _router: IRouter;
  private _appComponent: any;
  private _pluginManager: PluginManager;
  private _context: IAppContext;
  private _modelManager: IModelManager;

  constructor(options: IApplicationOptions) {
    this._router = options.router;
    this._context = {};
    this._modelManager = options.modelManager;
    this._appComponent = options.AppComponent;
    this._pluginManager = getManager();

    initPlugins(this._pluginManager, options.plugins || []);
  }

  get router() {
    return this._router;
  }

  get context() {
    return this._context;
  }

  get pluginManager() {
    return this._pluginManager;
  }

  get appComponent() {
    return this._appComponent;
  }

  async init() {
    await this._initPlugin();
    await this._initAppContext();
    await this._initAppComponent();
    this._router.init();
  }

  get modelManager() {
    return this._modelManager;
  }

  async updateComponents({ AppComponent }: IRerenderConfig = {}) {
    if (AppComponent && AppComponent !== this._appComponent) {
      this._appComponent = AppComponent;
    }
    await this._initAppComponent();
  }

  async dispose() {
    await this._pluginManager.runner.dispose();
  }

  private async _initPlugin() {
    await this._pluginManager.runner.init();
  }

  private async _initAppContext() {
    this._context = (await this._pluginManager.runner.getAppContext(
      this._context
    )) as IAppContext;
  }

  private async _initAppComponent() {
    this._appComponent = await this._pluginManager.runner.getAppComponent(
      this._appComponent,
      this._context
    );
  }

  getPublicAPI(): IApplication {
    return {
      context: this._context,
      router: this._router,
      appComponent: this._appComponent,
      modelManager: this._modelManager
    };
  }
}
