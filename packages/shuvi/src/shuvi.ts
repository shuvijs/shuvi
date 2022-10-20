import {
  IPlatform,
  getApi,
  Api,
  ShuviConfig,
  normalizeConfig
} from '@shuvi/service';
import platformWeb from '@shuvi/platform-web';
import { ShuviMode, ShuviPhase } from './types';

export function getPlatform(): IPlatform {
  return platformWeb({ framework: 'react' });
}

export interface ShuviOption {
  configFromCli: ShuviConfig;
  cwd?: string;
  phase?: ShuviPhase;
  mode?: ShuviMode;
  configFilePath?: string;
}

export async function initShuvi({
  configFromCli,
  ...options
}: ShuviOption): Promise<Api> {
  const normalizedConfig = normalizeConfig(configFromCli);
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
