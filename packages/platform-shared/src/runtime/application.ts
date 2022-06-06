import { IRouter } from '@shuvi/router';
import { CustomAppContext } from '@shuvi/runtime';
import { getManager, PluginManager } from './lifecycle';
import { setApp } from './appProxy';
import { IModelManager } from './appStore';

export interface ApplicationCreater<
  Context extends IContext,
  ExtendedOptions extends {} = Context,
  Router extends IRouter = IRouter,
  CompType = any
> {
  (
    options: {
      render: IAppRenderFn<Context, Router, CompType>;
    } & ExtendedOptions
  ): IApplication;
}

export interface IContext extends CustomAppContext {
  [x: string]: unknown;
}

export interface IAppComponent {}

export interface IApplication {
  AppComponent: IAppComponent;
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
  modelManager: IModelManager;
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
  UserAppComponent?: any;
};

export interface IApplicationOptions<
  Context extends IContext,
  Router extends IRouter,
  ModelManager extends IModelManager
> {
  AppComponent: any;
  router: Router;
  context: Context;
  modelManager: ModelManager;
  render: IAppRenderFn<Context, Router>;
  UserAppComponent?: any;
}

export class Application<
  Context extends IContext,
  Router extends IRouter = IRouter,
  ModelManager extends IModelManager = IModelManager
> implements IApplication
{
  AppComponent: any;
  router: Router;
  pluginManager: PluginManager;
  private _context: Context;
  private _modelManager: IModelManager;
  private _renderFn: IAppRenderFn<Context, Router>;
  private _UserAppComponent?: any;

  constructor(options: IApplicationOptions<Context, Router, ModelManager>) {
    this.AppComponent = options.AppComponent;
    this.router = options.router;
    this._context = options.context;
    this._modelManager = options.modelManager;
    this._renderFn = options.render;
    this._UserAppComponent = options.UserAppComponent;
    this.pluginManager = getManager();
  }

  async run() {
    await this._init();
    await this._createApplicationContext();
    await this._getAppComponent();
    await this._render();

    return this._context;
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
