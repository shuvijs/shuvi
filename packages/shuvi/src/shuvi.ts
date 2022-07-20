import { IPlatform, getApi, Api } from '@shuvi/service';
import platformWeb from '@shuvi/platform-web';
import { ShuviMode, ShuviPhase } from './types';
import { ShuviConfig, normalizeConfig } from './config';

export function getPlatform(): IPlatform {
  return platformWeb;
}

export interface ShuviOption {
  cwd?: string;
  phase?: ShuviPhase;
  mode?: ShuviMode;
  config: ShuviConfig;
}

export async function initShuvi({
  config,
  ...options
}: ShuviOption): Promise<Api> {
  const normalizedConfig = normalizeConfig(config);
  const { plugins, presets, ...restConfig } = normalizedConfig;
  const shuvi = await getApi({
    ...options,
    plugins,
    presets,
    config: restConfig,
    platform: getPlatform()
  });

  return shuvi;
}
