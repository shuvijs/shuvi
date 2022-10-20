import { PlatformWebCustomConfig } from '@shuvi/platform-web';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import { ShuviConfig } from '@shuvi/service';

function getDefaultPlatformConfig(): PlatformWebCustomConfig {
  return {
    ssr: true,
    router: {
      history: 'auto'
    },
    conventionRoutes: {}
  };
}

export function normalizeConfig(rawConfig: ShuviConfig): ShuviConfig {
  const config = deepmerge(getDefaultPlatformConfig(), rawConfig);
  if (config.router.history === 'auto') {
    config.router.history = config.ssr ? 'browser' : 'hash';
  }

  return config;
}

export function defineConfig(config: ShuviConfig): ShuviConfig {
  return config;
}
