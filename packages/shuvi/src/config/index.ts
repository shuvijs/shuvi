export type OptionsKeyMap = Record<
  string,
  string | ((config: any, optionValue: any) => void)
>;

export { normalizeConfig, defineConfig } from './config';

export { getConfigFromCli } from './utils';
