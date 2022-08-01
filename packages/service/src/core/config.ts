import { InternalConfig } from './apiTypes';
import { DEFAULT_PUBLIC_PATH } from '../constants';

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
  },
  disposeInactivePage: process.env.NODE_ENV === 'test' ? false : true
});
