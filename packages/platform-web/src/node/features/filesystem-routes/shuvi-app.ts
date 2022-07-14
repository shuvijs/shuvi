import { addRoutes } from './hooks';

declare module '@shuvi/runtime' {
  export interface CustomCorePluginHooks {
    addRoutes: typeof addRoutes;
  }
}
