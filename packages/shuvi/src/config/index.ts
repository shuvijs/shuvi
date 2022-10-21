export type OptionsKeyMap = Record<
  string,
  string | ((config: any, optionValue: any) => void)
>;

export { normalizePlatformConfig, defineConfig } from './config';

export { getConfigFromCli } from './utils';
