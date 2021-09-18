import AppComponent from '@shuvi/app/core/app';
import { Application } from '@shuvi/platform-core';
import runPlugins from '@shuvi/platform-core/lib/runPlugins';
import { Runtime } from '@shuvi/service';

export const create: Runtime.ApplicationCreater = function (context, options) {
  const app = new Application({
    AppComponent,
    context,
    render: options.render
  });
  runPlugins(app);
  return app;
};
