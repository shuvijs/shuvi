import {
  IPageRouteRecord,
  IAppData,
  IAppState,
  Application as _Application
} from '@shuvi/platform-shared/shared';
import { ApplicationImpl as _ApplicationImpl } from '@shuvi/platform-shared/shuvi-app/application';
import type { ShuviRequest } from '@shuvi/service';

export interface AppConfig {
  ssr: boolean;
}

export type InternalApplication = _ApplicationImpl<AppConfig>;

export type Application = _Application<AppConfig>;

export interface CreateAppServer {
  (options: { req: ShuviRequest; ssr: boolean }): InternalApplication;
}

export interface CreateAppClient {
  (options: {
    routes: IPageRouteRecord[];
    appComponent: any;
    appData: IAppData<any, IAppState>;
  }): InternalApplication;
}
