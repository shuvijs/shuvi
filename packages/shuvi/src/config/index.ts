import * as path from 'path';
import { PlatformWebCustomConfig } from '@shuvi/platform-web';
import { loadConfig, mergeConfig } from '@shuvi/service/lib/core/config';
import { ShuviConfig } from './configTypes';

export { ShuviConfig };

export type OptionsKeyMap = Record<
  string,
  string | ((config: any, optionValue: any) => void)
>;

export function getDefaultPlatformConfig(): PlatformWebCustomConfig {
  return {
    ssr: true,
    router: {
      history: 'auto'
    },
    conventionRoutes: {}
  };
}

export function normalizeConfig(rawConfig: ShuviConfig): ShuviConfig {
  const config = mergeConfig(getDefaultPlatformConfig(), rawConfig);
  if (config.router.history === 'auto') {
    config.router.history = config.ssr ? 'browser' : 'hash';
  }

  return config;
}

function set(obj: any, path: string, value: any) {
  const segments = path.split('.');
  const final = segments.pop()!;
  for (var i = 0; i < segments.length; i++) {
    if (!obj) {
      return;
    }
    obj = obj[segments[i]];
  }
  obj[final] = value;
}

function getConfigFromCliOtherOptions(
  cliOptions: Record<string, any>,
  cliOptionsKeyMap: OptionsKeyMap = {}
): ShuviConfig {
  const config = {};
  Object.keys(cliOptionsKeyMap).forEach(key => {
    if (typeof cliOptions[key] !== 'undefined') {
      const mappedKeyOrFunction = cliOptionsKeyMap[key];
      const cliOptionValue = cliOptions[key];
      if (typeof mappedKeyOrFunction === 'function') {
        mappedKeyOrFunction(config, cliOptionValue);
      } else {
        set(config, mappedKeyOrFunction, cliOptionValue);
      }
    }
  });
  try {
    const { configOverrides } = cliOptions;
    if (configOverrides) {
      const overrides = JSON.parse(configOverrides);
      Object.assign(config, overrides);
    }
  } catch (err) {
    console.error(err);
  }
  return config;
}

export async function getConfigFromCli(
  cwd: string,
  cliOptions: Record<string, any>,
  cliOptionsKeyMap: OptionsKeyMap = {}
): Promise<ShuviConfig> {
  const configFilePath =
    cliOptions.config && path.resolve(cwd, cliOptions.config);
  const configFromFile = await loadConfig({
    rootDir: cwd,
    filepath: configFilePath
  });
  const configFromCliOtherOptions = getConfigFromCliOtherOptions(
    cliOptions,
    cliOptionsKeyMap
  );
  const configFromCli = mergeConfig(configFromFile, configFromCliOtherOptions);
  return configFromCli;
}
