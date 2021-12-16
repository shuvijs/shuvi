import path from 'path';
import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import { PUBLIC_PATH } from '../constants';
import {
  ShuviServerConfig,
  NormalizedShuviServerConfig
} from './shuviServerTypes';

const getDefaultConfig: () => ShuviServerConfig = () => ({
  ssr: true,
  env: {},
  rootDir: process.cwd(),
  outputPath: 'dist',
  platform: {
    name: 'web',
    framework: 'react',
    target: 'ssr'
  },
  publicDir: 'public',
  publicPath: PUBLIC_PATH,
  router: {
    history: 'auto'
  },
  apiConfig: {
    prefix: '/api',
    bodyParser: true
  }
});

export function normalizeConfig(
  userConfig: ShuviServerConfig
): NormalizedShuviServerConfig {
  const config = deepmerge(getDefaultConfig(), userConfig, {
    _raw: userConfig
  }) as NormalizedShuviServerConfig;

  // ensure apiRouteConfigPrefix starts with '/'
  const apiRouteConfigPrefix = config.apiConfig!.prefix;
  if (apiRouteConfigPrefix) {
    config.apiConfig!.prefix = path.resolve('/', apiRouteConfigPrefix);
  }

  return config;
}
