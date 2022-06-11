import { getManager, PluginManager } from './lifecycle';
import { setApp } from './appProxy';
import { initPlugins, IPluginRecord, IRuntimeModule } from './lifecycle';
import { IModelManager } from './store';
import { IRouter, IRoute } from './routerTypes';
import {
  IApplication,
  IAppContext,
  IAppRenderFn,
  IApplicationOptions,
  IRerenderConfig,
  IRequest
} from './applicationTypes';

class Application<Context extends IAppContext> implements IApplication {
  router: IRouter;
  pluginManager: PluginManager;
  AppComponent: any;
  private _context: Context;
  private _modelManager: IModelManager;
  private _req?: IRequest;
  private _renderFn: IAppRenderFn<Context>;
  private _UserAppComponent?: any;

  constructor(options: IApplicationOptions<Context>) {
    this.router = options.router;
    this._context = options.context;
    this._modelManager = options.modelManager;
    this.AppComponent = options.AppComponent;
    this._UserAppComponent = options.UserAppComponent;
    this._renderFn = options.render;
    this._req = options.req;
    this.pluginManager = getManager();
  }

  async run() {
    await this._initPlugin();
    await this._initAppContext();
    await this._initAppComponent();
    await this._render();

    return this._context;
  }

  getContext() {
    return this._context;
  }

  getRouteLoaderContext(to: IRoute): any {
    // todo
    return {
      isServer: typeof window === 'undefined',
      pathname: to.pathname,
      query: to.query,
      params: to.params,
      appContext: this.getContext(),
      // redirect: redirector.handler,
      // error: error.handler,

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
      modelManager: this._modelManager,
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
