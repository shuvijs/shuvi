import { IRedirectState, IRouter } from '@shuvi/router';
import { IApplication, IAppStore } from '@shuvi/platform-shared/lib/runtime';
import { IServerPluginContext } from '@shuvi/service';

export interface IRenderResultRedirect extends IRedirectState {
  $type: 'redirect';
}

export interface IRendererConstructorOptions {
  serverPluginContext: IServerPluginContext;
}

export type IRenderDocumentOptions = {
  app: IApplication;
  AppComponent: any;
  router?: IRouter;
  appStore: IAppStore;
  appContext: any;
};
