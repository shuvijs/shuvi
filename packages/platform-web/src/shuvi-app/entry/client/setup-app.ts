import { CLIENT_CONTAINER_ID } from '@shuvi/shared/lib/constants';
// renderer must be imported before application
// we need to init init renderer before import AppComponent
import {
  view,
  getRoutes,
  app as PlatformAppComponent
} from '@shuvi/app/core/platform';
import { getAppData } from '@shuvi/platform-shared/esm/runtime';
import { createApp } from '../../create-app/client';

const appData = getAppData();

const app = createApp({
  appData
});

const render = () => {
  const appContainer = document.getElementById(CLIENT_CONTAINER_ID)!;
  view.renderApp({
    app: app.getPublicAPI(),
    appData,
    appContainer
  });
};

const run = async () => {
  await app.init();
  render();
};

export { run };

if (module.hot) {
  const handleHotUpdate = async () => {
    const rerender = async () => {
      const routes = require('@shuvi/app/files/routes').default;
      const UserAppComponent = require('@shuvi/app/user/app').default;
      app.router.replaceRoutes(getRoutes(routes, app.context, appData));
      await app.updateComponents({
        AppComponent: PlatformAppComponent,
        UserAppComponent
      });
      render();
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
}
