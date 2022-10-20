import { IPlatform, getApi, Api, ShuviConfig } from '@shuvi/service';
import platformWeb from '@shuvi/platform-web';
import { ShuviMode, ShuviPhase } from './types';
import { normalizeConfig } from './config';

export function getPlatform(): IPlatform {
  return platformWeb({ framework: 'react' });
}

export interface ShuviOption {
  config: ShuviConfig;
  cwd?: string;
  phase?: ShuviPhase;
  mode?: ShuviMode;
  configFilePath?: string;
}

export async function initShuvi({
  config,
  ...options
}: ShuviOption): Promise<Api> {
  const normalizedConfig = normalizeConfig(config);
  const shuvi = await getApi({
    ...options,
    config: normalizedConfig,
    platform: getPlatform()
  });

  return shuvi;
}
