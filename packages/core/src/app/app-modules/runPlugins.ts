import { IApplication, IAppPluginRecord, IInitAppPlugins } from '../../types';

const runPlugins = ({
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

export default runPlugins;
