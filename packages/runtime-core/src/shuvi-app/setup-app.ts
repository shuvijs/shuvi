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

const appData = getAppData();
const appContainer = document.getElementById(CLIENT_CONTAINER_ID)!;

const app = create(
  {
    pageData: appData.pageData || {},
    error: function (error: IError) {
      if (error?.message === NOT_FOUND_ERROR_MESSAGE) {
        error = undefined;
      } else {
        console.error(error);
      }

      view.renderError({
        appContext: this,
        appContainer,
        appData,
        error
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
