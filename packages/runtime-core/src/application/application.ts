import {
  IApplication,
  IAppRenderFn,
  IRerenderConfig,
  AppHooks
} from '@shuvi/types';

import { Hookable } from '@shuvi/hooks';

import { IRouter } from '@shuvi/router';

export type IContext = {
  [x: string]: any;
};

export interface IApplicationOptions<Context> {
  AppComponent: any;
  router?: IRouter;
  context: Context;
  render: IAppRenderFn;
}

export class Application<Context extends {}> extends Hookable
  implements IApplication {
  AppComponent: any;
  router?: IRouter;
  private _renderFn: IAppRenderFn;
  private _context: IContext;

  constructor(options: IApplicationOptions<Context>) {
    super();
    this.AppComponent = options.AppComponent;
    this.router = options.router;
    this._context = options.context;
    this._renderFn = options.render;
  }

  async run() {
    await this._init();
    await this._createApplicationContext();
    await this._getAppComponent();
    await this._render();

    return this._context;
  }

  async rerender({ AppComponent, router }: IRerenderConfig = {}) {
    if (router) {
      this.router = router;
    }
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
    })) as IContext;
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
      AppComponent: this.AppComponent,
      router: this.router
    });
    this.emitEvent<AppHooks.IEventRenderDone>('renderDone', result);
  }
}
