import { extendedHooks } from './hooks';

declare module '@shuvi/service' {
  export interface PluginHooks {
    addEntryCode: typeof extendedHooks.addEntryCode;
    addPolyfill: typeof extendedHooks.addPolyfill;
    modifyRuntimeConfig: typeof extendedHooks.modifyRuntimeConfig;
  }
}
