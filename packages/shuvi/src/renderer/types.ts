import { Runtime } from '@shuvi/types';
import { Api } from '../api';

export interface IRendererConstructorOptions {
  api: Api;
}

export type IRenderDocumentOptions = {
  app: Runtime.IApplication;
  url: string;
  AppComponent: any;
  ErrorComponent: any;
  routes: Runtime.IRoute[];
  appContext: any;
  onRedirect(redirect: Runtime.IRedirectState): void;
};
