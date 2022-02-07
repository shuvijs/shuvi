import { createSyncWaterfallHook } from '@shuvi/hook';
import { IUserRouteConfig } from '@shuvi/service';

export const appRoutes = createSyncWaterfallHook<IUserRouteConfig[]>();

declare module '@shuvi/service' {
  export interface PluginHooks {
    appRoutes: typeof appRoutes;
  }
}
