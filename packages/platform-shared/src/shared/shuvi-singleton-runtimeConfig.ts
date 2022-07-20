import { IRuntimeConfig } from './runtimeConfigTypes';

let runtimeConfig: IRuntimeConfig | null;
let publicRuntimeConfig: IRuntimeConfig | null;

/**
 * getRuntimeConfig function
 *
 * @returns runtimeConfig
 */
export function getRuntimeConfig() {
  return {
    ...(runtimeConfig || {}),
    ...(publicRuntimeConfig || {})
  };
}

export function getPublicRuntimeConfig(): IRuntimeConfig | null {
  return publicRuntimeConfig;
}

export function setRuntimeConfig(config: IRuntimeConfig) {
  runtimeConfig = config;
}

export function setPublicRuntimeConfig(config: IRuntimeConfig) {
  publicRuntimeConfig = config;
}
