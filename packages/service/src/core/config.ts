import { InternalConfig } from './apiTypes';
import { DEFAULT_PUBLIC_PATH } from '../constants';

export const getDefaultConfig: () => InternalConfig = () => ({
  env: {},
  rootDir: process.cwd(),
  analyze: false,
  outputPath: 'build',
  publicPath: DEFAULT_PUBLIC_PATH,
  typescript: {
    ignoreBuildErrors: false
  },
  disposeInactivePage: process.env.NODE_ENV === 'test' ? false : true,
  experimental: {
    parcelCss: false,
    preBundle: false
  }
});
