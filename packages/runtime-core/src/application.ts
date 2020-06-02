//@ts-nocheck
import { Runtime } from '@shuvi/types';

export interface IApplicationOptions<Context> {
  AppComponent: any;
  routes: Runtime.IRoute[];
  context: Context;
}

export class Application<Context extends {}> {
  private _AppComponent: any;
  private _routes: Runtime.IRoute[];
  private _context: Context;

  constructor(options: IApplicationOptions<Context>) {
    this._AppComponent = options.AppComponent;
    this._routes = options.routes;
    this._context = options.context;
  }

  run() {
    this._initApplicationContext();
    // beforeRender
    this._render();
    // afterRender
  }

  private _initApplicationContext() {
    // todo
    // this._context = {};
  }

  private _render() {}
}
