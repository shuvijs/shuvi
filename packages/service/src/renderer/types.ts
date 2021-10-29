import { IServerModule } from '../types/index';
import { IRouter } from '@shuvi/router';
import { IApplication, IAppStore } from '@shuvi/runtime-core';
import { Api } from '../api';

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
