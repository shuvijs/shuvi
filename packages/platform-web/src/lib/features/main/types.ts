import { appRoutes } from './hooks'

import '../../types/resources'

declare module '@shuvi/runtime' {
  export interface CustomCorePluginHooks {
    appRoutes: typeof appRoutes;
  }
}
