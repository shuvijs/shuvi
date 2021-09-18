import { runPlugins, IApplication } from '@shuvi/runtime-core';
import initPlugins from '@shuvi/app/user/plugin';
import { pluginRecord } from '@shuvi/app/core/plugins';

export default (application: IApplication): void => {
  const tap = application.tap.bind(application);
  runPlugins({ tap, initPlugins, pluginRecord });
};
