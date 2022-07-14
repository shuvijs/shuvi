import { createAsyncParallelHook } from '@shuvi/hook';
import { IUserRouteConfig } from '@shuvi/service';

export const addRoutes = createAsyncParallelHook<
  void,
  void,
  IUserRouteConfig[]
>();
