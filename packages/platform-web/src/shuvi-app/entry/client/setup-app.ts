import { CLIENT_CONTAINER_ID } from '@shuvi/shared/lib/constants';
// renderer must be imported before application
// we need to init init renderer before import AppComponent
import { view } from '@shuvi/app/core/platform';
import { IRouter } from '@shuvi/router';
import { getAppData, IAppRouteConfig } from '@shuvi/platform-core';
import { createApp } from '../../create-app/client';

const appData = getAppData();
const { routeProps = {} } = appData;
const { appState } = appData;

const app = createApp(
  {
    pageData: appData.pageData || {},
    routeProps
  },
  {
    async render({ appContext, AppComponent, router = [], appStore }) {
      const appContainer = document.getElementById(CLIENT_CONTAINER_ID)!;
      view.renderApp({
        AppComponent,
        router: router as IRouter<IAppRouteConfig>,
        appData,
        appContainer,
        appContext,
        appStore
      });
    },
    appState
  }
);

const rerender = () => {
  app.rerender();
};

export { app, rerender };
