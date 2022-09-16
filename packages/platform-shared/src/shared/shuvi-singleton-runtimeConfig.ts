import { IRuntimeConfig } from './runtimeConfigTypes';

const isServer = typeof window === 'undefined';

/**
 * use global this to store runtime config, so we can safely bundle this module
 * and get rid of the multiple-module-instance problem.
 * */
const KEY_SERVER_RUNTIME_CONFIG = Symbol.for('shuvi_server_runtime_config');
const KEY_PUBLIC_RUNTIME_CONFIG = Symbol.for('shuvi_client_runtime_config');

let publicRuntimeConfig: IRuntimeConfig | undefined | null;
let serverRuntimeConfig: IRuntimeConfig | undefined | null;

/**
 * getRuntimeConfig function
 *
 * @returns serverRuntimeConfig
 */
export function getRuntimeConfig() {
  return {
    ...(getServerRuntimeConfig() || {}),
    ...(getPublicRuntimeConfig() || {})
  };
}

export function getPublicRuntimeConfig(): IRuntimeConfig | undefined | null {
  if (isServer) {
    return (globalThis as any)[KEY_PUBLIC_RUNTIME_CONFIG];
  } else {
    return publicRuntimeConfig;
  }
}

export function setPublicRuntimeConfig(config: IRuntimeConfig | null) {
  if (isServer) {
    (globalThis as any)[KEY_PUBLIC_RUNTIME_CONFIG] = config;
  } else {
    publicRuntimeConfig = config;
  }
}

export function getServerRuntimeConfig(): IRuntimeConfig | undefined | null {
  if (isServer) {
    return (globalThis as any)[KEY_SERVER_RUNTIME_CONFIG];
  } else {
    return serverRuntimeConfig;
  }
}

export function setServerRuntimeConfig(config: IRuntimeConfig | null) {
  if (isServer) {
    (globalThis as any)[KEY_SERVER_RUNTIME_CONFIG] = config;
  } else {
    serverRuntimeConfig = config;
  }
}
