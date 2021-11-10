import { IRedirectState, IRouter } from '@shuvi/router';
import { IApplication, IAppStore } from '@shuvi/runtime-core';
import { Api } from '@shuvi/service';
import { IServerModule } from '../../types';

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
