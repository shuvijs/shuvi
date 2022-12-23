import { CLIENT_CONTAINER_ID } from '@shuvi/shared/constants';
// renderer must be imported before application
// we need to init renderer before import AppComponent
import {
  view,
  getRoutes,
  app as PlatformAppComponent
} from '@shuvi/app/core/platform';
import routes from '@shuvi/app/files/routes';
import { getAppData } from '@shuvi/platform-shared/shared/helper/getAppData';
import { createApp } from '../../app/client';

const appData = getAppData();

const app = createApp({
  appComponent: PlatformAppComponent,
  routes,
  appData
});

const render = async () => {
  const appContainer = document.getElementById(CLIENT_CONTAINER_ID)!;
  await view.renderApp({
    app: app.getPublicAPI(),
    appData,
    appContainer
  });
};

const run = async () => {
  await app.init();
  await render();
};

export { run, app };

if (module.hot) {
  const handleHotUpdate = async () => {
    const rerender = async () => {
      app.router.replaceRoutes(getRoutes(routes));
      await app.updateComponents({
        AppComponent: PlatformAppComponent
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

  module.hot.accept(['@shuvi/app/files/routes'], handleHotUpdate);
}

// For e2e test
if ((window as any).__SHUVI) {
  (window as any).__SHUVI.router = app.router;
} else {
  (window as any).__SHUVI = { router: app.router };
}
