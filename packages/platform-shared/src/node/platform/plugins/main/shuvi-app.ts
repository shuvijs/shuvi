import { extendedHooks } from './hooks';

declare module '@shuvi/runtime' {
  export interface CustomCorePluginHooks {
    addEntryCode: typeof extendedHooks.addEntryCode;
    addPolyfill: typeof extendedHooks.addPolyfill;
    modifyRuntimeConfig: typeof extendedHooks.modifyRuntimeConfig;
  }
}
