import { Runtime } from '@shuvi/types';
import initPlugins from '@shuvi/app/core/plugin';
import pluginsHash from '@shuvi/app/core/pluginsHash';

const runPlugins = (tap: Runtime.IApplication['tap']) => {
  initPlugins({
    registerPlugin: tap,
    applyPluginOption: (name, options) => {
      let pluginSelected = pluginsHash[name];
      if (!pluginSelected) {
        console.warn(
          '[' +
            name +
            '] plugin is being applied options but does not match plugins in "shuvi.config.js".'
        );
      } else {
        pluginsHash[name].options = options;
      }
    }
  });

  Object.values(pluginsHash).forEach(fn => fn(tap, fn.options));
};

export default runPlugins;
