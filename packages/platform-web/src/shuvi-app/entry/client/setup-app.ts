import {
  CLIENT_CONTAINER_ID,
  SHUVI_ERROR_CODE
} from '@shuvi/shared/lib/constants';
// renderer must be imported before application
// we need to init init renderer before import AppComponent
import { view } from '@shuvi/app/core/platform';
import { create } from '@shuvi/app/core/client/application';
import { getAppData } from '@shuvi/platform-core/lib/helper';
import { getAppStore, getErrorHandler } from '@shuvi/platform-core';
import { IRouter } from '@shuvi/router/lib/types';
const appData = getAppData();
const { routeProps = {} } = appData;
const { appState } = appData;

const appStore = getAppStore(appState);

const app = create(
  {
    pageData: appData.pageData || {},
    routeProps
  },
  {
    async render({ appContext, AppComponent, router }) {
      const appContainer = document.getElementById(CLIENT_CONTAINER_ID)!;
      router?.afterEach(_current => {
        if (!_current.matches) {
          getErrorHandler().errorHandler(SHUVI_ERROR_CODE.PAGE_NOT_FOUND);
        }
      });
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
