import { IRuntimeConfig } from './src/shared';

export {};

declare global {
  namespace ShuviService {
    interface CustomConfig {
      publicRuntimeConfig?: IRuntimeConfig;
      runtimeConfig?: IRuntimeConfig;
    }
  }
}
