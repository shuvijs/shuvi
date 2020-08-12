import { CLIENT_CONTAINER_ID } from '@shuvi/shared/lib/constants';
// renderer must be imported before application
// we need to init init renderer before import AppComponent
import view from '@shuvi/app/core/view';
import { create } from '@shuvi/app/core/application';
import { getAppData } from './helper/getAppData';

const appData = getAppData();

const app = create(
  {
    pageData: appData.pageData || {}
  },
  {
    async render({ appContext, AppComponent, routes }) {
      const appContainer = document.getElementById(CLIENT_CONTAINER_ID)!;

      try {
        if (appData.hasError) {
          view.renderError({
            appContainer,
            appContext,
            appData,
            error: undefined
          });
        } else {
          view.renderApp({
            AppComponent: AppComponent,
            routes,
            appData,
            appContainer,
            appContext
          });
        }
      } catch (error) {
        // Tay: This is not used by React, because React doesn't throw error during render. I'm not sure whether Vue would need this as well.
        view.renderError({
          appContainer,
          appContext,
          appData,
          error
        });
      }
    }
  }
);

const rerender = () => {
  app.rerender();
};

export { app, rerender };
