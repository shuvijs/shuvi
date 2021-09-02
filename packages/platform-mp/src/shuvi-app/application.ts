import AppComponent from '@shuvi/app/core/app';
import initPlugins from '@shuvi/app/user/plugin';
import { pluginRecord } from '@shuvi/app/core/plugins';
import { Application, runPlugins } from '@shuvi/runtime-core';
import { Runtime } from '@shuvi/types';

export const create: Runtime.ApplicationCreater = function (context, options) {
  const app = new Application({
    AppComponent,
    context,
    render: options.render
  });

  runPlugins({
    tap: app.tap.bind(app),
    initPlugins,
    pluginRecord
  });

  return app;
};
