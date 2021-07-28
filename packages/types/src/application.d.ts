import { Hookable } from '@shuvi/hooks';
import { IRouter } from '@shuvi/router';
export interface IRenderOptions<CompType = any> {
  AppComponent: CompType;
  router?: IRouter;
  appContext: Record<string, any>;
  render?: (renderAppToString: () => string, appContext: any) => string;
}

export type IRerenderConfig = {
  AppComponent?: any;
  router?: IRouter;
};

export interface IAppRenderFn {
  (options: IRenderOptions): Promise<any>;
}

export interface IApplication extends Hookable {
  AppComponent: any;
  router?: IRouter;
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
