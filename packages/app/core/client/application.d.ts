import { IAppRenderFn, IApplication } from '@shuvi/runtime-core';
import { IAppState } from '@shuvi/platform-core';
export interface IApplicationCreaterContext {
  routeProps?: { [x: string]: any };
  [x: string]: any;
}
export interface ApplicationCreater {
  (
    context: IApplicationCreaterContext,
    options: {
      render: IAppRenderFn;
      appState?: IAppState;
    }
  ): IApplication;
}
export const create: ApplicationCreater;
