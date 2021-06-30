import { CLIENT_CONTAINER_ID } from '@shuvi/shared/lib/constants';
// renderer must be imported before application
// we need to init init renderer before import AppComponent
import view from '@shuvi/app/platform/view';
import routesNormalizer from '@shuvi/app/platform/routesNormalizer';
import { create } from '@shuvi/app/core/application';
import { getAppData } from './helper/getAppData';
const appData = getAppData();
const {
  router: { history: historyMode },
  routeProps = {}
} = appData;

const app = create(
  {
    pageData: appData.pageData || {},
    routeProps,
    historyMode,
  },
  {
    async render({ appContext, AppComponent, router }) {
      const appContainer = document.getElementById(CLIENT_CONTAINER_ID)!;

      view.renderApp({
        AppComponent: AppComponent,
        router,
        appData,
        appContainer,
        appContext
      });
    },
    routesNormalizer
  }
);

const rerender = () => {
  app.rerender();
};

export { app, rerender };
