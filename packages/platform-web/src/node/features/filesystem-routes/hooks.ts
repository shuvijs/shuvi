import { createAsyncParallelHook, createSyncBailHook } from '@shuvi/hook';
import {
  IPageRouteConfig,
  IMiddlewareRouteConfig,
  IApiRouteConfig
} from '@shuvi/platform-shared/shared';
import type { IServerPluginContext, ShuviRequest } from '@shuvi/service';

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

export const addApiRoutes = createAsyncParallelHook<
  void,
  void,
  IApiRouteConfig[]
>();

type AppConfigCtx = {
  req: ShuviRequest;
};

type AppConfig = IServerPluginContext['appConfig'];

export const getAppConfig = createSyncBailHook<void, AppConfigCtx, AppConfig>();
