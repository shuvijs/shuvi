import { deepmerge } from '@shuvi/utils/lib/deepmerge';
import { InternalConfig } from '../apiTypes';
import { DEFAULT_PUBLIC_PATH } from '../../constants';

export const getDefaultConfig: () => InternalConfig = () => ({
  env: {},
  rootDir: process.cwd(),
  analyze: false,
  outputPath: 'dist',
  publicDir: 'public',
  publicPath: DEFAULT_PUBLIC_PATH,
  typescript: {
    ignoreBuildErrors: false
  },
  experimental: {
    parcelCss: false,
    preBundle: false
  }
});

export function mergeConfig(...configs: any[]): any {
  return deepmerge(...configs);
}
