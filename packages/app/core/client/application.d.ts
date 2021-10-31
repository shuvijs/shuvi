import { IAppState, ApplicationCreater } from '@shuvi/runtime-core';
import { IRouter } from '@shuvi/router';
import {
  IAppRouteConfig,
  IApplicationCreaterClientContext
} from '@shuvi/platform-core';

export const create: ApplicationCreater<
  IApplicationCreaterClientContext,
  IRouter<IAppRouteConfig>,
  React.ComponentType,
  IAppState
>;
