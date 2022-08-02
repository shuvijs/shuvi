import { getManager, PluginManager } from './lifecycle';
import { initPlugins } from './lifecycle';
import { Store, redox } from '@shuvi/redox';
import { ErrorModel, errorModel } from './models/error';
import { IRouter, IPageRouteRecord } from './routerTypes';
import {
  IStoreManager,
  IApplication,
  IAppContext,
  IApplicationOptions,
  IRerenderConfig
} from './applicationTypes';

export class Application {
  private _error: Store<ErrorModel>;
  private _router: IRouter<IPageRouteRecord>;
  private _appComponent: any;
  private _pluginManager: PluginManager;
  private _context: IAppContext;
  private _storeManager: IStoreManager;

  constructor(options: IApplicationOptions) {
    this._router = options.router;
    this._context = {} as IAppContext;
    this._storeManager = redox({ initialState: options.initialState });
    this._error = this._storeManager.get(errorModel);
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

  get error() {
    return this._error;
  }

  async init() {
    await this._initPlugin();
    await this._initAppContext();
    await this._initAppComponent();
    this._router.init();
  }

  get storeManager() {
    return this._storeManager;
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
    this._context = (await this._pluginManager.runner.appContext(
      this._context
    )) as IAppContext;
  }

  private async _initAppComponent() {
    this._appComponent = await this._pluginManager.runner.appComponent(
      this._appComponent,
      this._context
    );
  }

  getPublicAPI(): IApplication {
    return {
      context: this._context,
      router: this._router,
      appComponent: this._appComponent,
      storeManager: this._storeManager,
      error: this._error
    };
  }
}
