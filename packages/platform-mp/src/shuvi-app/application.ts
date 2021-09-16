import AppComponent from '@shuvi/app/core/app';
import { Application } from '@shuvi/platform-core';
import { Runtime } from '@shuvi/service';

export const create: Runtime.ApplicationCreater = function (context, options) {
  const app = new Application({
    AppComponent,
    context,
    render: options.render
  });

  return app;
};
