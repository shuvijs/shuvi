import * as AppHooks from './hooks';
import { Hookable } from '@shuvi/hook';
import { IRouter } from '@shuvi/router';

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

export interface IRenderOptions<Context, Router, AppStore> {
  AppComponent: any;
  router?: Router;
  appContext: Context;
  appStore: AppStore;
  render?: (renderAppToString: () => string, appContext: any) => string;
}

export interface IAppRenderFn<Context, Router, AppStore> {
  (options: IRenderOptions<Context, Router, AppStore>): Promise<any>;
}

export type IRerenderConfig = {
  AppComponent?: any;
};

export interface IApplicationOptions<Context, Router, AppStore> {
  AppComponent: any;
  router: Router;
  context: Context;
  appStore: AppStore;
  render: IAppRenderFn<Context, Router, AppStore>;
}

export class Application<
    Context extends {},
    Router extends IRouter = IRouter,
    AppStore = any
  >
  extends Hookable
  implements IApplication
{
  AppComponent: any;
  router: Router;
  private _context: Context & IContext;
  private _appStore: AppStore;
  private _renderFn: IAppRenderFn<Context, Router, AppStore>;

  constructor(options: IApplicationOptions<Context, Router, AppStore>) {
    super();
    this.AppComponent = options.AppComponent;
    this.router = options.router;
    this._context = options.context;
    this._appStore = options.appStore;
    this._renderFn = options.render;
  }

  async run() {
    await this._init();
    await this._createApplicationContext();
    await this._getAppComponent();
    await this._render();

    return this._context;
  }

  async rerender({ AppComponent }: IRerenderConfig = {}) {
    if (AppComponent) {
      this.AppComponent = AppComponent;
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
