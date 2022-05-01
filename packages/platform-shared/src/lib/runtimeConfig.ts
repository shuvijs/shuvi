import { IRuntimeConfig } from '@shuvi/service/lib/core';

let runtimeConfig: IRuntimeConfig | null;

/**
 * getRuntimeConfig function
 *
 * @returns runtimeConfig
*/
export default () => {
  return runtimeConfig || {};
};

export function setRuntimeConfig(config: IRuntimeConfig) {
  runtimeConfig = config;
}
