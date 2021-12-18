import { IRedirectState, IRouter } from '@shuvi/router';
import { IApplication, IAppStore } from '@shuvi/runtime-core';
import { IPluginContext } from '@shuvi/service';

export interface IRenderResultRedirect extends IRedirectState {
  $type: 'redirect';
}

export interface IRendererConstructorOptions {
  serverPluginContext: IPluginContext;
}

export type IRenderDocumentOptions = {
  app: IApplication;
  AppComponent: any;
  router?: IRouter;
  appStore: IAppStore;
  appContext: any;
};
