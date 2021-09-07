import AppComponent from '@shuvi/app/core/app';
import { Application } from '@shuvi/runtime-core';
import { Runtime } from '@shuvi/types';

export const create: Runtime.ApplicationCreater = function (context, options) {
  const app = new Application({
    AppComponent,
    context,
    render: options.render
  });

  return app;
};
