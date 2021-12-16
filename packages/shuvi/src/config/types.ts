import {
  ShuviServerConfig,
  IServerPluginInstance,
  IServerPluginConstructor
} from '@shuvi/service';

export type IPluginConfig =
  | string
  | IServerPluginConstructor
  | IServerPluginInstance
  | [string | ((param: any) => IServerPluginInstance), any?];

export type IPresetConfig =
  | string
  | [string /* plugin module */, any? /* plugin options */];

export interface UserConfig extends ShuviServerConfig {
  presets?: IPresetConfig[];
  plugins?: IPluginConfig[];
}

export interface NormalizedUserConfig extends Omit<UserConfig, 'rootDir'> {
  rootDir: string;
}

export type IPresetSpec = () => {
  presets?: UserConfig['presets'];
  plugins?: UserConfig['plugins'];
};

export interface IPreset {
  id: string;
  get: () => IPresetSpec;
}
