import { Hookable } from '@shuvi/hooks';
import { IRoute } from './route';

export interface IRenderOptions<CompType = any> {
  AppComponent: CompType;
  routes: IRoute[];
  appContext: Record<string, any>;
}

export type IRerenderConfig = {
  AppComponent?: any;
  routes?: IRoute[];
};

export interface IAppRenderFn {
  (options: IRenderOptions): Promise<any>;
}

export interface IApplication extends Hookable {
  AppComponent: any;
  routes: IRoute[];
  run(): Promise<{ [k: string]: any }>;
  rerender(config?: IRerenderConfig): Promise<void>;
  dispose(): Promise<void>;
}

export interface IAppPlugin<O extends {} = {}> {
  (tap: IApplication['tap'], options?: O): void;
  options?: O;
}

export type IInitAppPlugins = (params: {
  applyPluginOption: <T extends {}>(name: string, options: T) => void;
  registerPlugin: IApplication['tap'];
}) => void;

export interface IPlugin<O extends {} = {}> {
  (tap: IApplication['tap'], options?: O): void;
  options?: O;
}

export type IAppPluginRecord = {
  [name: string]: IPlugin;
};
