import { CLIENT_CONTAINER_ID } from '@shuvi/shared/lib/constants';
// renderer must be imported before application
// we need to init init renderer before import AppComponent
import view from '@shuvi/app/core/view';
import { create } from '@shuvi/app/core/application';
import { getAppData } from './helper/getAppData';

const appData = getAppData();
const appContainer = document.getElementById(CLIENT_CONTAINER_ID)!;

const app = create(
  {
    pageData: appData.pageData || {}
  },
  {
    async render({ appContext, AppComponent, ErrorComponent, routes }) {
      if (appData.error) {
        view.renderError({
          error: appData.error,
          AppComponent,
          ErrorComponent,
          routes,
          appData,
          appContainer,
          appContext
        });
      } else {
        view.renderApp({
          AppComponent: AppComponent,
          ErrorComponent,
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
