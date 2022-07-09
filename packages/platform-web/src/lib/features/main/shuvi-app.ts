import { appRoutes } from './hooks';

declare module '@shuvi/runtime' {
  export interface CustomCorePluginHooks {
    appRoutes: typeof appRoutes;
  }
}
