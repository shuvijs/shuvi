import { IAppRenderFn, IApplication, IAppState } from '@shuvi/runtime-core';
import { IRouter } from '@shuvi/router';
import {
  IAppRouteConfig,
  IApplicationCreaterClientContext
} from '@shuvi/platform-core';

export interface ApplicationCreater<Context, AppState extends IAppState = any> {
  (
    context: Context,
    options: {
      render: IAppRenderFn<Context, IRouter<IAppRouteConfig>>;
      appState?: AppState;
    }
  ): IApplication;
}

export const create: ApplicationCreater<
  IApplicationCreaterClientContext,
  IAppState
>;
