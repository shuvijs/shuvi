import { IRouter } from '@shuvi/router';
import { getManager, PluginManager } from './lifecycle';
import { IAppStore, IAppState } from './appStore';

export interface ApplicationCreater<
  Context extends IContext,
  Router extends IRouter = IRouter,
  CompType = any,
  AppState extends IAppState = any
> {
  (
    context: Context,
    options: {
      render: IAppRenderFn<Context, Router, CompType>;
      appState?: AppState;
    }
  ): IApplication;
}

export type IContext = {
  [x: string]: any;
};

export interface IApplication {
  AppComponent: any;
  router?: IRouter;
  pluginManager: PluginManager;
  run(): Promise<{ [k: string]: any }>;
  rerender(config?: IRerenderConfig): Promise<void>;
  dispose(): Promise<void>;
}

export interface IRenderOptions<
  Context,
  Router extends IRouter,
  CompType = any
> {
  AppComponent: CompType;
  router?: Router;
  appContext: Context;
  appStore: IAppStore;
}

export interface IView<
  RenderOption extends IRenderOptions<IContext, IRouter> = any,
  RenderResult = void
> {
  renderApp(options: RenderOption): RenderResult;
}

export interface IAppRenderFn<Context, Router extends IRouter, CompType = any> {
  (options: IRenderOptions<Context, Router, CompType>): Promise<any>;
}

export type IRerenderConfig = {
  AppComponent?: any;
  getUserAppComponent?: <T>(appComponent: T) => T;
};

export interface IApplicationOptions<
  Context extends IContext,
  Router extends IRouter,
  AppStore extends IAppStore
> {
  AppComponent: any;
  router: Router;
  context: Context;
  appStore: AppStore;
  render: IAppRenderFn<Context, Router>;
  getUserAppComponent?: <T>(appComponent: T) => T;
}

export class Application<
  Context extends IContext,
  Router extends IRouter = IRouter,
  AppStore extends IAppStore = IAppStore
> implements IApplication
{
  AppComponent: any;
  router: Router;
  pluginManager: PluginManager;
  private _context: Context;
  private _appStore: IAppStore;
  private _renderFn: IAppRenderFn<Context, Router>;
  private _getUserAppComponent?: <T>(appComponent: T) => T;

  constructor(options: IApplicationOptions<Context, Router, AppStore>) {
    this.AppComponent = options.AppComponent;
    this.router = options.router;
    this._context = options.context;
    this._appStore = options.appStore;
    this._renderFn = options.render;
    this._getUserAppComponent = options.getUserAppComponent;
    this.pluginManager = getManager();
  }

  async run() {
    await this._init();
    await this._createApplicationContext();
    await this._getAppComponent();
    await this._render();

    return this._context;
  }

  async rerender({ AppComponent, getUserAppComponent }: IRerenderConfig = {}) {
    if (AppComponent && AppComponent !== this.AppComponent) {
      this.AppComponent = AppComponent;
    }
    if (getUserAppComponent) {
      if (getUserAppComponent !== this._getUserAppComponent) {
        this._getUserAppComponent = getUserAppComponent;
      }
    } else {
      this._getUserAppComponent = undefined;
    }

    await this._getAppComponent();
    await this._render();
  }

  async dispose() {
    await this.pluginManager.runner.dispose();
  }

  getContext() {
    return this._context;
  }

  private async _init() {
    await this.pluginManager.runner.init();
  }

  private async _createApplicationContext() {
    this._context = (await this.pluginManager.runner.getAppContext(
      this._context
    )) as IContext & Context;
  }

  private async _getAppComponent() {
    this.AppComponent = await this.pluginManager.runner.getRootAppComponent(
      this.AppComponent,
      this._context
    );
    if (typeof this._getUserAppComponent === 'function') {
      this.AppComponent = this._getUserAppComponent(this.AppComponent);
    }
    this.AppComponent = await this.pluginManager.runner.getAppComponent(
      this.AppComponent,
      this._context
    );
  }

  private async _render() {
    await this._renderFn({
      appContext: this._context,
      appStore: this._appStore,
      AppComponent: this.AppComponent,
      router: this.router
    });
  }
}
