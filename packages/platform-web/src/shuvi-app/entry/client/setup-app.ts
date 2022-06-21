import { CLIENT_CONTAINER_ID } from '@shuvi/shared/lib/constants';
// renderer must be imported before application
// we need to init renderer before import AppComponent
import {
  view,
  getRoutes,
  app as PlatformAppComponent
} from '@shuvi/app/core/platform';
import { IRouter } from '@shuvi/router';
import {
  getAppData,
  IPageRouteRecord
} from '@shuvi/platform-shared/esm/runtime';
import { createClientApp } from '../../create-app/client';

const appData = getAppData();

const app = createClientApp({
  async render({ appContext, AppComponent, router = [], modelManager }) {
    const appContainer = document.getElementById(CLIENT_CONTAINER_ID)!;
    await view.renderApp({
      AppComponent,
      router: router as IRouter<IPageRouteRecord>,
      appData,
      appContainer,
      appContext,
      modelManager
    });
  },
  appData
});

const rerender = () => {
  app.rerender();
};

if (module.hot) {
  const handleHotUpdate = async () => {
    const rerender = async () => {
      const routes = require('@shuvi/app/files/routes').default;
      const UserAppComponent = require('@shuvi/app/user/app').default;
      app.router.replaceRoutes(getRoutes(routes));
      app.rerender({ AppComponent: PlatformAppComponent, UserAppComponent });
    };

    // if we are in the midsf of route transition, don't render unit it's done
    if ((app.router as any)._pending) {
      const removelistener = app.router.afterEach(() => {
        removelistener();
        rerender();
      });
    } else {
      rerender();
    }
  };

  module.hot.accept(
    ['@shuvi/app/user/app', '@shuvi/app/files/routes'],
    handleHotUpdate
  );

  module.hot.accept('@shuvi/app/files/page-loaders', () => {
    const loaders = require('@shuvi/app/files/page-loaders').default;
    app.setLoaders(loaders);
  });
}

export { app, rerender };
