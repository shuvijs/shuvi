import { IAppRenderFn, IApplication } from '@shuvi/runtime-core'
export interface IApplicationCreaterContext {
  routeProps?: { [x: string]: any };
  [x: string]: any;
}
export interface ApplicationCreater {
  (
    context: IApplicationCreaterContext,
    options: {
      render: IAppRenderFn;
    }
  ): IApplication;
}
export const create: ApplicationCreater;
