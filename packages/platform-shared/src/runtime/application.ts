import { getManager, PluginManager } from './lifecycle';
import { setApp } from './appProxy';
import { IModelManager } from './appStore';
import {
  IApplication,
  IAppContext,
  IRouter,
  IAppRenderFn,
  IApplicationOptions,
  IRerenderConfig
} from './applicationTypes';

export class Application<Context extends IAppContext> implements IApplication {
  AppComponent: any;
  router: IRouter;
  pluginManager: PluginManager;
  private _context: Context;
  private _modelManager: IModelManager;
  private _renderFn: IAppRenderFn<Context>;
  private _UserAppComponent?: any;

  constructor(options: IApplicationOptions<Context>) {
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
    )) as IAppContext & Context;
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
