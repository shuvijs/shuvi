import { Runtime, RuntimeHooks } from '@shuvi/types';
import { Hookable } from '@shuvi/hooks';

export type IContext = {
  [x: string]: any;
};

export interface IApplicationOptions<Context> {
  AppComponent: any;
  routes: Runtime.IRoute[];
  context: Context;
  render: Runtime.IAppRenderFn;
}

export class Application<Context extends {}> extends Hookable
  implements Runtime.IApplication {
  AppComponent: any;
  routes: Runtime.IRoute[];

  private _renderFn: Runtime.IAppRenderFn;
  private _context: IContext;

  constructor(options: IApplicationOptions<Context>) {
    super();
    this.AppComponent = options.AppComponent;
    this.routes = options.routes;
    this._context = options.context;
    this._renderFn = options.render;
  }

  async run() {
    await this._init();
    await this._createApplicationContext();
    await this._render();
  }

  async rerender() {
    await this._render();
  }

  async dispose() {
    await this.callHook<RuntimeHooks.IHookDispose>({
      name: 'dispose',
      parallel: true
    });
  }

  private async _init() {
    await this.callHook<RuntimeHooks.IHookInit>('init');
  }

  private async _createApplicationContext() {
    this._context = (await this.callHook<RuntimeHooks.IHookCreateAppContext>({
      name: 'create-app-context',
      initialValue: this._context
    })) as IContext;
  }

  private async _render() {
    const result = await this._renderFn({
      appContext: this._context,
      AppComponent: this.AppComponent,
      routes: this.routes
    });
    this.emitEvent<RuntimeHooks.IEventRenderDone>('render-done', result);
  }
}
