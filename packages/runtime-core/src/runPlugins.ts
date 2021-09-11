import { IApplication } from './application';

export interface IAppPlugin<O extends {} = {}> {
  (tap: IApplication['tap'], options?: O): void;
  options?: O;
}

export type IInitAppPlugins = (params: {
  applyPluginOption: <T extends {}>(name: string, options: T) => void;
  registerPlugin: IApplication['tap'];
}) => void;

export interface IPlugin<O extends {} = {}> {
  (tap: IApplication['tap'], options?: O): void;
  options?: O;
}

export type IAppPluginRecord = {
  [name: string]: IPlugin;
};

export const runPlugins = ({
  tap,
  pluginRecord,
  initPlugins
}: {
  tap: IApplication['tap'];
  pluginRecord: IAppPluginRecord;
  initPlugins: IInitAppPlugins;
}) => {
  initPlugins({
    registerPlugin: tap,
    applyPluginOption: (name, options) => {
      let pluginSelected = pluginRecord[name];
      if (!pluginSelected) {
        console.warn(
          '[' +
            name +
            '] plugin is being applied options but does not match plugins in "shuvi.config.js".'
        );
      } else {
        pluginRecord[name].options = options;
      }
    }
  });

  Object.values(pluginRecord).forEach(fn => fn(tap, fn.options));
};
