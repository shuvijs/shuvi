import { IRuntimeConfig } from '../api';

let runtimeConfig: IRuntimeConfig | null;
export default () => {
  return runtimeConfig || {};
};

export function setRuntimeConfig(config: IRuntimeConfig) {
  runtimeConfig = config;
}
