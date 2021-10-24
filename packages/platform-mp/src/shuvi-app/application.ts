import AppComponent from '@shuvi/app/core/app';
import { Application, getAppStore, IAppState } from '@shuvi/platform-core';
import runPlugins from '@shuvi/platform-core/lib/runPlugins';
import { Runtime } from '@shuvi/service';

export const create: Runtime.ApplicationCreater<IAppState> = function (
  context,
  options
) {
  const appStore = getAppStore(options.appState);
  const app = new Application({
    AppComponent,
    context,
    appStore,
    render: options.render
  });
  runPlugins(app);
  return app;
};
