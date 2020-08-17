import {
  CLIENT_CONTAINER_ID,
  NOT_FOUND_ERROR_MESSAGE
} from '@shuvi/shared/lib/constants';
// renderer must be imported before application
// we need to init init renderer before import AppComponent
import view from '@shuvi/app/core/view';
import { create } from '@shuvi/app/core/application';
import { getAppData } from './helper/getAppData';
import { IError } from '@shuvi/core';
import { handleRouterError } from '@shuvi/router';

const appData = getAppData();
const appContainer = document.getElementById(CLIENT_CONTAINER_ID)!;

const app = create(
  {
    pageData: appData.pageData || {},
    error: function (error: IError) {
      handleRouterError((window as any).__SHUVI.router);
      if (error?.message === NOT_FOUND_ERROR_MESSAGE) {
        error = undefined;
      }

      view.renderError({
        appContext: this,
        appContainer,
        appData,
        error,
        ErrorComponent: app.ErrorComponent
      });
    }
  },
  {
    async render({ appContext, AppComponent, routes }) {
      if (appData.error) {
        appContext.error({ message: appData.error });
      } else {
        view.renderApp({
          AppComponent: AppComponent,
          routes,
          appData,
          appContainer,
          appContext
        });
      }
    }
  }
);

const rerender = () => {
  app.rerender();
};

export { app, rerender };
