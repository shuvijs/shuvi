import { IRuntimeConfig } from '@shuvi/platform-core';

export function getPublicRuntimeConfig(
  runtimeConfig: IRuntimeConfig
): IRuntimeConfig {
  const keys = Object.keys(runtimeConfig);

  const res: IRuntimeConfig = {};

  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];

    if (key.startsWith('$')) continue;

    res[key] = runtimeConfig[key];
  }

  return res;
}
