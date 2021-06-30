import { Runtime } from '@shuvi/types';
import { Api } from '../api';

export interface IRendererConstructorOptions {
  api: Api;
}

export type IRenderDocumentOptions = {
  app: Runtime.IApplication;
  AppComponent: any;
  router: Runtime.IRouter;
  appContext: any;
  render?: Runtime.IServerModule['render'];
};
