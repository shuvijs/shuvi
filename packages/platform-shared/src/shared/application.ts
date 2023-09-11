import { getManager, PluginManager } from './runtimPlugin';
import { initPlugins } from './runtimPlugin';
import { ModelPublicInstance, doura } from 'doura';
import { ErrorModel, errorModel, errorModelName } from './models/error';
import { LoaderModel, loaderModel, loaderModelName } from './models/loader';
import { IRouter } from './routerTypes';
import {
  Doura,
  Application,
  IAppContext,
  ApplicationInternalOptions,
  IRerenderConfig,
  IError,
  GetLoadersFn
} from './applicationTypes';

export class ApplicationImpl<Config extends {} = {}> {
  private _router: IRouter;
  private _appComponent: any;
  private _pluginManager: PluginManager;
  private _context: IAppContext;
  private _config: Config;
  private _store: Doura;
  private _error: ModelPublicInstance<ErrorModel>;
  private _loader: ModelPublicInstance<LoaderModel>;
  private _getLoaders: GetLoadersFn;

  constructor(options: ApplicationInternalOptions<Config>) {
    this._config = options.config;
    this._router = options.router;
    this._context = {} as IAppContext;
    this._store = doura({ initialState: options.initialState });
    this._error = this._store.getModel(errorModelName, errorModel);
    this._loader = this._store.getModel(loaderModelName, loaderModel);
    this._getLoaders = options.getLoaders;
    this._appComponent = options.AppComponent;
    this._pluginManager = getManager();
    initPlugins(this._pluginManager, options.plugins || []);
  }

  get router() {
    return this._router;
  }

  get config() {
    return this._config;
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
    return this._error.errorObject;
  }

  setError(err: IError) {
    this._error.set(err);
  }

  clearError() {
    this._error.clear();
  }

  getLoaders() {
    return this._getLoaders();
  }

  getLoadersData() {
    return this._loader.getAllData;
  }

  setLoadersData(datas: Record<string, any>) {
    this._loader.setDatas(datas);
  }

  async init() {
    await this._initPlugin();
    await this._initAppContext();
    this._router.init();
    await this._initAppComponent();
  }

  get store() {
    return this._store;
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
    await this._pluginManager.runner.appContext(this._context, {
      router: this._router
    });
  }

  private async _initAppComponent() {
    this._appComponent = await this._pluginManager.runner.appComponent(
      this._appComponent,
      this._context
    );
  }

  getPublicAPI(): Application<Config> {
    const self = this;
    return {
      get config() {
        return self._config;
      },
      get context() {
        return self._context;
      },
      get router() {
        return self._router;
      },
      get appComponent() {
        return self._appComponent;
      },
      get store() {
        return self._store;
      },
      get error() {
        return self.error;
      },
      setError(err) {
        self.setError(err);
      },
      clearError() {
        self.clearError();
      },
      getLoadersData() {
        return self.getLoadersData();
      },
      setLoadersData(datas: Record<string, any>) {
        self.setLoadersData(datas);
      }
    };
  }
}
