import { IAppRenderFn, IApplication } from '@shuvi/runtime-core';
import { IAppState } from '@shuvi/platform-core';
import { IRouter } from '@shuvi/router';
import { IAppRouteConfig } from '@shuvi/service/lib/api';
import { Store } from '@shuvi/shared/lib/miniRedux';
import { Runtime } from '@shuvi/service';

export interface ApplicationCreater<appState = any> {
  (
    context: Runtime.IApplicationCreaterClientContext,
    options: {
      render: IAppRenderFn<
        Runtime.IApplicationCreaterClientContext,
        IRouter<IAppRouteConfig>,
        Store<appState, any>
      >;
      appState?: appState;
    }
  ): IApplication;
}
export const create: ApplicationCreater<IAppState>;
