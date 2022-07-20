import { IRuntimeConfig } from '../shared';

declare module '@shuvi/service/lib/core/apiTypes' {
  interface CustomConfig {
    publicRuntimeConfig?: IRuntimeConfig;
    runtimeConfig?: IRuntimeConfig;
  }
}
