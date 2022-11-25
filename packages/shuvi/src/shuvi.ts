import { IPlatform, getApi, Api, ShuviConfig } from '@shuvi/service';
import platformWeb from '@shuvi/platform-web';
import { ShuviMode, ShuviPhase } from './types';
import { normalizePlatformConfig } from './config';
//@ts-ignore
import pkgInfo from '../package.json';

export function getPlatform(): IPlatform {
  return platformWeb({ framework: 'react' });
}

export interface ShuviOption {
  config: ShuviConfig;
  cwd?: string;
  phase?: ShuviPhase;
  mode?: ShuviMode;
  configFile?: string;
}

export async function initShuvi({
  config,
  ...options
}: ShuviOption): Promise<Api> {
  const { plugins, presets, ...restConfig } = config;
  const shuvi = await getApi({
    ...options,
    plugins,
    presets,
    config: restConfig,
    platform: getPlatform(),
    normalizePlatformConfig,
    version: pkgInfo.version
  });

  return shuvi;
}
