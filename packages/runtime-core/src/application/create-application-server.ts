import AppComponent from '@shuvi/app/core/app';
import routes from '@shuvi/app/core/pageRoutes';
import { getRoutes } from '@shuvi/app/core/platform';
import initPlugins from '@shuvi/app/user/plugin';
import { pluginRecord } from '@shuvi/app/core/plugins';
import { Application } from './application';
import runPlugins from './runPlugins';
import { createRouter, createMemoryHistory } from '@shuvi/router';
import { Runtime } from '@shuvi/types';

export const create: Runtime.ApplicationCreater = function (context, options) {
  const { req } = context as Runtime.IApplicationCreaterServerContext;
  const history = createMemoryHistory({
    initialEntries: [(req && req.url) || '/'],
    initialIndex: 0
  });

  const router = createRouter({
    history,
    routes: getRoutes(routes, context)
  });

  const app = new Application({
    AppComponent,
    router,
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
