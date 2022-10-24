import { extendedHooks } from './plugins/main/hooks';
import { IRuntimeConfig } from '../../shared';

declare global {
  namespace ShuviService {
    interface CustomConfig {
      publicRuntimeConfig?: IRuntimeConfig;
      serverRuntimeConfig?: IRuntimeConfig;
    }

    interface CustomCorePluginHooks {
      addEntryCode: typeof extendedHooks.addEntryCode;
      modifyRuntimeConfig: typeof extendedHooks.modifyRuntimeConfig;
    }
  }
}
