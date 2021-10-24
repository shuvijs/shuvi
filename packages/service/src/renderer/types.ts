import { IServerModule } from '../types/runtime';
import { IRouter } from '@shuvi/router';
import { IApplication } from '@shuvi/runtime-core';
import { Api } from '../api';

export interface IRendererConstructorOptions {
  api: Api;
}

export type IRenderDocumentOptions<appStore = any> = {
  app: IApplication;
  AppComponent: any;
  router?: IRouter;
  appStore: appStore;
  appContext: any;
  render?: IServerModule['render'];
};
