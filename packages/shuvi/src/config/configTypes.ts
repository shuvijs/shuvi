import { Config, IPluginConfig, IPresetConfig } from '@shuvi/service';

export interface ShuviConfig extends Config {
  presets?: IPresetConfig[];
  plugins?: IPluginConfig[];
}
