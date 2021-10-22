import { CLIENT_CONTAINER_ID } from '@shuvi/shared/lib/constants';
// renderer must be imported before application
// we need to init init renderer before import AppComponent
import { view } from '@shuvi/app/core/platform';
import { create } from '@shuvi/app/core/client/application';
import { getAppData } from '@shuvi/platform-core/lib/helper';
import { IRouter } from '@shuvi/router/lib/types';
import { getAppStore } from '@shuvi/platform-core';

const appData = getAppData();
const { routeProps = {}, appState } = appData;
const appStore = getAppStore(appState);

const app = create(
  {
    pageData: appData.pageData || {},
    routeProps
  },
  {
    async render({ appContext, AppComponent, router }) {
      const appContainer = document.getElementById(CLIENT_CONTAINER_ID)!;
      view.renderApp({
        AppComponent: AppComponent,
        router: router as IRouter,
        appData,
        appContainer,
        appContext,
        appStore
      });
    }
  }
);

const rerender = () => {
  app.rerender();
};

export { app, rerender };
