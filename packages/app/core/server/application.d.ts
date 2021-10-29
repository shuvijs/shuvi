import {
  ApplicationCreater,
  IAppState
} from '@shuvi/runtime-core';
import { IRouter } from '@shuvi/router';
import {
  IAppRouteConfig,
  IApplicationCreaterServerContext
} from '@shuvi/platform-core';

export const create: ApplicationCreater<
  IApplicationCreaterServerContext,
  IRouter<IAppRouteConfig>,
  React.ComponentType,
  IAppState
  >;
