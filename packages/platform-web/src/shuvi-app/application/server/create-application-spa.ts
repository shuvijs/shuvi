import { Application, getAppStore } from '@shuvi/platform-core';
import { Runtime } from '@shuvi/service';
export const create: Runtime.ApplicationCreater = function (context, options) {
  const appStore = getAppStore();
  return new Application({
    AppComponent: null,
    context,
    appStore,
    render: options.render
  });
};
