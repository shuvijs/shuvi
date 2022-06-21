import { getManager, PluginManager } from './lifecycle';
import { setApp } from './appProxy';
import { initPlugins, IPluginRecord, IRuntimeModule } from './lifecycle';
import { IModelManager, getLoaderModel } from './store';
import {
  IRouteLoaderContext,
  LoaderFn,
  runLoaders,
  ILoaderOptions,
  getInvalidRoutes
} from './loader';
import { IRouter, IRoute, IPageRouteRecord } from './routerTypes';
import {
  IApplication,
  IAppContext,
  IAppRenderFn,
  IApplicationOptions,
  IRerenderConfig,
  IRequest
} from './applicationTypes';
import * as response from './response';

const isServer = typeof window === 'undefined';

class Application<Context extends IAppContext> implements IApplication {
  router: IRouter;
  pluginManager: PluginManager;
  modelManager: IModelManager;
  AppComponent: any;

  private _context: Context;
  private _req?: IRequest;
  private _renderFn: IAppRenderFn<Context>;
  private _UserAppComponent?: any;
  private _loadersById: Record<string, LoaderFn>;
  private _loaderOptions: ILoaderOptions;

  constructor(options: IApplicationOptions<Context>) {
    this.router = options.router;
    this._context = {} as Context;
    this.modelManager = options.modelManager;
    this._loadersById = options.loaders;
    this._loaderOptions = options.loaderOptions;
    this.AppComponent = options.AppComponent;
    this._UserAppComponent = options.UserAppComponent;
    this._renderFn = options.render;
    this._req = options.req;
    this.pluginManager = getManager();
  }

  setLoaders(loaders: Record<string, LoaderFn>) {
    if (isServer) {
      console.warn(
        `try to set "loaders" in server, the operation will be ignored`
      );
      return;
    }

    this._loadersById = loaders;
  }

  async run() {
    await this._initPlugin();
    await this._initAppContext();
    await this._initAppComponent();
    await this._render();
  }

  getContext() {
    return this._context;
  }

  async runLoaders(
    to: IRoute<IPageRouteRecord>,
    from: IRoute<IPageRouteRecord>,
    hydrate: boolean = false
  ) {
    const loaderModel = getLoaderModel(this.modelManager);
    const routes = getInvalidRoutes(this._loadersById, to, from);

    if (routes.length && hydrate) {
      const loadersById = loaderModel.$state().loadersById;
      // skip those that be ready on server
      while (loadersById[routes[0].id].data) {
        routes.shift();
      }
    }

    if (!routes.length) {
      return;
    }

    const ids = routes.map(route => route.id);

    loaderModel.loading(ids);
    const { datas, redirect, error } = await runLoaders(
      this._loadersById,
      routes,
      this._getRouteLoaderContext(to),
      this._loaderOptions
    );

    if (datas.length) {
      loaderModel.success(
        datas.map((data, index) => ({
          id: ids[index],
          data: data
        }))
      );
    }

    if (datas.length < ids.length) {
      loaderModel.fail(ids.slice(datas.length));
    }

    return redirect || error;
  }

  _getRouteLoaderContext(to: IRoute): IRouteLoaderContext {
    return {
      isServer: typeof window === 'undefined',
      pathname: to.pathname,
      query: to.query,
      params: to.params,
      appContext: this.getContext(),
      redirect: response.redirect,
      error: response.error,

      // server only
      req: this._req
    };
  }

  async rerender({ AppComponent, UserAppComponent }: IRerenderConfig = {}) {
    if (AppComponent && AppComponent !== this.AppComponent) {
      this.AppComponent = AppComponent;
    }
    if (UserAppComponent) {
      if (UserAppComponent !== this._UserAppComponent) {
        this._UserAppComponent = UserAppComponent;
      }
    } else {
      this._UserAppComponent = undefined;
    }

    await this._initAppComponent();
    await this._render();
  }

  async dispose() {
    await this.pluginManager.runner.dispose();
  }

  private async _initPlugin() {
    await this.pluginManager.runner.init();
  }

  private async _initAppContext() {
    this._context = (await this.pluginManager.runner.getAppContext(
      this._context
    )) as IAppContext & Context;
  }

  private async _initAppComponent() {
    this.AppComponent = await this.pluginManager.runner.getRootAppComponent(
      this.AppComponent,
      this._context
    );
    setApp(this.AppComponent);
    this.AppComponent = await this.pluginManager.runner.getAppComponent(
      this._UserAppComponent ? this._UserAppComponent : this.AppComponent,
      this._context
    );
  }

  private async _render() {
    await this._renderFn({
      appContext: this._context,
      modelManager: this.modelManager,
      AppComponent: this.AppComponent,
      router: this.router
    });
  }
}

export default function application<Context extends IAppContext>({
  inlinePlugin,
  plugins,
  ...appOptions
}: IApplicationOptions<Context> & {
  inlinePlugin?: Partial<IRuntimeModule>;
  plugins?: IPluginRecord;
}) {
  const application = new Application(appOptions);
  initPlugins(application.pluginManager, inlinePlugin || {}, plugins || {});

  return application;
}
