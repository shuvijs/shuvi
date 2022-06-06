import { CLIENT_CONTAINER_ID } from '@shuvi/shared/lib/constants';
// renderer must be imported before application
// we need to init init renderer before import AppComponent
import { view } from '@shuvi/app/core/platform';
import { IRouter } from '@shuvi/router';
import {
  getAppData,
  IAppRouteConfig
} from '@shuvi/platform-shared/esm/runtime';
import { createApp } from '../../create-app/client';
import { getLoaderManager } from '../../react/loader/loaderManager';

const appData = getAppData();
const { routeProps = {}, appState, loadersData = {} } = appData;

// loaderManager is created here and will be cached.
getLoaderManager(loadersData);

const app = createApp(
  {
    pageData: appData.pageData || {},
    routeProps
  },
  {
    async render({ appContext, AppComponent, router = [], modelManager }) {
      const appContainer = document.getElementById(CLIENT_CONTAINER_ID)!;
      view.renderApp({
        AppComponent,
        router: router as IRouter<IAppRouteConfig>,
        appData,
        appContainer,
        appContext,
        modelManager
      });
    },
    appState
  }
);

const rerender = () => {
  app.rerender();
};

export { app, rerender };
