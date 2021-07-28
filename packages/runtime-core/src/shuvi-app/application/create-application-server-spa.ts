import { Application } from './application';
import { Runtime } from '@shuvi/types';
export const create: Runtime.ApplicationCreater = function (context, options) {
  return new Application({
    AppComponent: null,
    context,
    render: options.render
  });
};
