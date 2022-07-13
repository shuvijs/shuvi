import {
  Application,
  IRequest,
  IRawPageRouteRecord,
  IAppData,
  IAppState
} from '@shuvi/platform-shared/shared';

export interface CreateAppServer {
  (options: { req: IRequest; ssr: boolean }): Application;
}

export interface CreateAppClient {
  (options: {
    routes: IRawPageRouteRecord[];
    appComponent: any;
    appData: IAppData<any, IAppState>;
  }): Application;
}
