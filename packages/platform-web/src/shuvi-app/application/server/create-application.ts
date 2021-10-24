import AppComponent from '@shuvi/app/core/app';
import routes from '@shuvi/app/core/routes';
import { getRoutes } from '@shuvi/app/core/platform';
import { Application, getAppStore, IAppState } from '@shuvi/platform-core';
import runPlugins from '@shuvi/platform-core/lib/runPlugins';
import { createRouter, createMemoryHistory } from '@shuvi/router';
import { Runtime } from '@shuvi/service';

export const create: Runtime.ApplicationCreater<IAppState> = function (
  context,
  options
) {
  const { req } = context as Runtime.IApplicationCreaterServerContext;
  const history = createMemoryHistory({
    initialEntries: [(req && req.url) || '/'],
    initialIndex: 0
  });

  const router = createRouter({
    history,
    routes: getRoutes(routes, context)
  });

  const appStore = getAppStore(options.appState);

  const app = new Application({
    AppComponent,
    router,
    appStore,
    context,
    render: options.render
  });
  runPlugins(app);

  return app;
};
