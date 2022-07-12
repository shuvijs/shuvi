import { createSyncWaterfallHook } from '@shuvi/hook';
import { IUserRouteConfig } from '@shuvi/service';

export const appRoutes = createSyncWaterfallHook<IUserRouteConfig[]>();
