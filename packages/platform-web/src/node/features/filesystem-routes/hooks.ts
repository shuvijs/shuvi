import { createAsyncParallelHook } from '@shuvi/hook';
import {
  IPageRouteConfig,
  IMiddlewareRouteConfig
} from '@shuvi/platform-shared/shared';

export const addRoutes = createAsyncParallelHook<
  void,
  void,
  IPageRouteConfig[]
>();

export const addMiddlewareRoutes = createAsyncParallelHook<
  void,
  void,
  IMiddlewareRouteConfig[]
>();
