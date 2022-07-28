import { CLIENT_CONTAINER_ID } from '@shuvi/shared/lib/constants';
// renderer must be imported before application
// we need to init init renderer before import AppComponent
import {
  view,
  getRoutes,
  app as PlatformAppComponent
} from '@shuvi/app/core/platform';
import routes from '@shuvi/app/files/routes';
import { getAppData } from '@shuvi/platform-shared/shared/helper/getAppData';
import { createApp } from '../../app/client';

type devClient = {
  sendMessage: (data: any) => void;
  subscribeToHmrEvent?: (handler: any) => void;
  reportRuntimeError?: (err: any) => void;
};

const appData = getAppData();

const app = createApp({
  appComponent: PlatformAppComponent,
  routes,
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

const run = async (devClient?: devClient) => {
  await app.init();
  render();

  if (devClient) {
    app.router.afterEach(() => {
      devClient.sendMessage(
        JSON.stringify({
          event: 'routesUpdate',
          currentRoutes: app.router.current.matches
        })
      );
    });
  }
};

export { run };

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
