import { IRuntimeConfig } from '@shuvi/types';

let runtimeConfig: IRuntimeConfig | null;

export default () => {
  return runtimeConfig || {};
};

export function hasSetRuntimeConfig(): boolean {
  return runtimeConfig !== null;
}

export function setRuntimeConfig(config: IRuntimeConfig) {
  runtimeConfig = config;
}
