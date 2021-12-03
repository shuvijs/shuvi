import { Hookable } from '@shuvi/hook';
import { IRouter } from '@shuvi/router';

import * as AppHooks from './hooks';
import { IAppStore, IAppState, getAppStore } from './appStore';

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

export interface IApplication extends Hookable {
  AppComponent: any;
  router?: IRouter;
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
  render?: (renderAppToString: () => string, appContext: any) => string;
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
  getUserAppComponent?: <T>(appComponent: T) => T
};

export interface IApplicationOptions<
  Context extends IContext,
  Router extends IRouter,
  AppState extends IAppState | undefined
> {
  AppComponent: any;
  router: Router;
  context: Context;
  appState: AppState;
  render: IAppRenderFn<Context, Router>;
  getUserAppComponent?: <T>(appComponent: T) => T
}

export class Application<
    Context extends IContext,
    Router extends IRouter = IRouter,
    AppState extends IAppState | undefined = undefined
  >
  extends Hookable
  implements IApplication
{
  AppComponent: any;
  router: Router;
  private _context: Context & IContext;
  private _appStore: IAppStore;
  private _renderFn: IAppRenderFn<Context, Router>;
  private _getUserAppComponent?: <T>(appComponent: T) => T

  constructor(options: IApplicationOptions<Context, Router, AppState>) {
    super();
    this.AppComponent = options.AppComponent;
    this.router = options.router;
    this._context = options.context;
    this._appStore = getAppStore(options.appState);
    this._renderFn = options.render;
    this._getUserAppComponent = options.getUserAppComponent
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
        this._getUserAppComponent = getUserAppComponent
      }
    } else {
      this._getUserAppComponent = undefined
    }

    await this._getAppComponent();
    await this._render();
  }

  async dispose() {
    await this.callHook<AppHooks.IHookDispose>({
      name: 'dispose',
      parallel: true
    });
  }

  getContext() {
    return this._context;
  }

  private async _init() {
    await this.callHook<AppHooks.IHookInit>('init');
  }

  private async _createApplicationContext() {
    this._context = (await this.callHook<AppHooks.IHookCreateAppContext>({
      name: 'createAppContext',
      initialValue: this._context
    })) as IContext & Context;
  }

  private async _getAppComponent() {
    this.AppComponent =
      await this.callHook<AppHooks.IHookGetRootAppComponent>(
        {
          name: 'getRootAppComponent',
          initialValue: this.AppComponent
        },
        this._context
      );
    if (this._getUserAppComponent && typeof this._getAppComponent === 'function') {
      this.AppComponent = await this._getUserAppComponent(this.AppComponent)
    }
    this.AppComponent = await this.callHook<AppHooks.IHookGetAppComponent>(
      {
        name: 'getAppComponent',
        initialValue: this.AppComponent
      },
      this._context
    );
  }

  private async _render() {
    const result = await this._renderFn({
      appContext: this._context,
      appStore: this._appStore,
      AppComponent: this.AppComponent,
      router: this.router
    });
    this.emitEvent<AppHooks.IEventRenderDone>('renderDone', result);
  }
}
