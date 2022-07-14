import { createAsyncParallelHook } from '@shuvi/hook';
import { IUserRouteConfig, IMiddlewareRouteConfig } from '@shuvi/service';

export const addRoutes = createAsyncParallelHook<
  void,
  void,
  IUserRouteConfig[]
>();

export const addMiddlewareRoutes = createAsyncParallelHook<
  void,
  void,
  IMiddlewareRouteConfig[]
>();
