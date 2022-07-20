import { ShuviConfig } from './configTypes';

export type { ShuviConfig };

export type OptionsKeyMap = Record<
  string,
  string | ((config: any, optionValue: any) => void)
>;

export { normalizeConfig, loadConfig, defineConfig } from './config';

export { getConfigFromCli } from './utils';
