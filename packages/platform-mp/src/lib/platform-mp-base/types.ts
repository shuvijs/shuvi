import { AppConfig as TaroAppConfig, Config } from '@tarojs/taro';
export interface AppConfig extends TaroAppConfig {
  entryPagePath?: string;
  darkMode: boolean;
}

/**
 * configs for app and pages
 */
export interface AppConfigs {
  app: AppConfig;
  [name: string]: Config;
}

export interface IFileType {
  templ: string;
  style: string;
  config: string;
  script: string;
  xs: string;
}
