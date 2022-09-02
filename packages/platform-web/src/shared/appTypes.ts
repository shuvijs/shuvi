import {
  IPageRouteRecord,
  IAppData,
  IAppState
} from '@shuvi/platform-shared/shared';
import { Application } from '@shuvi/platform-shared/shuvi-app/application';
import type { ShuviRequest } from '@shuvi/service';

export interface CreateAppServer {
  (options: { req: ShuviRequest; ssr: boolean }): Application;
}

export interface CreateAppClient {
  (options: {
    routes: IPageRouteRecord[];
    appComponent: any;
    appData: IAppData<any, IAppState>;
  }): Application;
}
