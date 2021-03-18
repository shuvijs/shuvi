import { Runtime } from '@shuvi/types';
import { Api } from '../api';

export interface IRendererConstructorOptions {
  api: Api;
}

export type IRenderDocumentOptions = {
  app: Runtime.IApplication;
  url: string;
  AppComponent: any;
  routes: Runtime.IAppRouteConfig[];
  appContext: any;
  render?: Runtime.IServerModule['render'];
};
