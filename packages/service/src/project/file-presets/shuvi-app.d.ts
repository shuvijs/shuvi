declare module '@shuvi/app/core/plugins' {
  import { IPluginInstance } from '@shuvi/hook';

  export type IRuntimePluginWithOptions = (
    ...params: any[]
  ) => IPluginInstance<any, any>;

  export type IRuntimePlugin =
    | IPluginInstance<any, any>
    | IRuntimePluginWithOptions;
  export type IPluginRecord = {
    [name: string]: {
      plugin: IRuntimePlugin;
      options: string;
    };
  };
  export const pluginRecord: IPluginRecord;
}
