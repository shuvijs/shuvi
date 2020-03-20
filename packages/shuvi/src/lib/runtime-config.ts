import { IRuntimeConfig } from "@shuvi/types";

const EMPTY = {};

let getRuntimeConfig: () => IRuntimeConfig = () => EMPTY;

export default () => {
  return getRuntimeConfig();
};

export function setRuntimeConfig(configGetter: () => IRuntimeConfig) {
  getRuntimeConfig = configGetter;
}
