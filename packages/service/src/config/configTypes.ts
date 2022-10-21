import { Config, IPluginConfig, IPresetConfig } from '../core';

export interface ShuviConfig extends Config {
  presets?: IPresetConfig[];
  plugins?: IPluginConfig[];
}
