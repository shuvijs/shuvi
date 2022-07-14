import { addRoutes, addMiddlewareRoutes } from './hooks';

declare module '@shuvi/runtime' {
  export interface CustomCorePluginHooks {
    addRoutes: typeof addRoutes;
    addMiddlewareRoutes: typeof addMiddlewareRoutes;
    // addAPIRoutes: typeof addAPIRoutes;
  }
}
