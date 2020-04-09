import { IRuntimeConfig } from "@shuvi/types";

const EMPTY = {};

let runtimeConfig: IRuntimeConfig = EMPTY;

export default () => {
  return runtimeConfig;
};

export function setRuntimeConfig(config: IRuntimeConfig) {
  runtimeConfig = config;
}
