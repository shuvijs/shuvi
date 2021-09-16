import AppComponent from '@shuvi/app/core/app';
import routes from '@shuvi/app/core/routes';
import { getRoutes } from '@shuvi/app/core/platform';
import { Application } from '@shuvi/platform-core';
import { createRouter, createMemoryHistory } from '@shuvi/router';
import { Runtime } from '@shuvi/service';

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

  return app;
};
