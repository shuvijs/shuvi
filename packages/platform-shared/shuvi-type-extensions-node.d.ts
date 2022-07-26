import { IRuntimeConfig } from './src/shared';
import { extendedHooks } from './src/node/platform/plugins/main/hooks';

export {};

declare global {
  namespace ShuviService {
    interface CustomConfig {
      publicRuntimeConfig?: IRuntimeConfig;
      runtimeConfig?: IRuntimeConfig;
    }

    interface CustomCorePluginHooks {
      addEntryCode: typeof extendedHooks.addEntryCode;
      addPolyfill: typeof extendedHooks.addPolyfill;
      modifyRuntimeConfig: typeof extendedHooks.modifyRuntimeConfig;
    }
  }
}
