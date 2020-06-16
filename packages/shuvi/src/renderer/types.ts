import { Runtime } from '@shuvi/types';
import { Api } from '../api';

export interface IRendererConstructorOptions {
  api: Api;
}

export interface IServerRendererContext {
  appData: Record<string, any>;
}

export type IRenderDocumentOptions = {
  url: string;
  AppComponent: any;
  routes: Runtime.IRoute[];
  appContext: any;
};
