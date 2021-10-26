import { IAppRenderFn, IApplication } from '@shuvi/runtime-core';
import { IAppState, IAppStore } from '@shuvi/platform-core';
import { IRouter } from '@shuvi/router';
import { IAppRouteConfig } from '@shuvi/service/lib/api';
import { Runtime } from '@shuvi/service';

export interface ApplicationCreater<Context, AppState extends IAppState = any> {
  (
    context: Context,
    options: {
      render: IAppRenderFn<Context, IRouter<IAppRouteConfig>, IAppStore>;
      appState?: AppState;
    }
  ): IApplication;
}
export const create: ApplicationCreater<
  Runtime.IApplicationCreaterServerContext,
  IAppState
>;
