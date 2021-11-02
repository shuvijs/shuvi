import { IRedirectState, IRouter } from '@shuvi/router';
import { IApplication, IAppStore } from '@shuvi/runtime-core';
import { Api, IServerModule } from '@shuvi/service';

export interface IRenderResultRedirect extends IRedirectState {
  $type: 'redirect';
}

export interface IRendererConstructorOptions {
  api: Api;
}

export type IRenderDocumentOptions = {
  app: IApplication;
  AppComponent: any;
  router?: IRouter;
  appStore: IAppStore;
  appContext: any;
  render?: IServerModule['render'];
};
