import { Application } from '@shuvi/platform-core';
import { Runtime } from '@shuvi/types';
export const create: Runtime.ApplicationCreater = function (context, options) {
  return new Application({
    AppComponent: null,
    context,
    render: options.render
  });
};
