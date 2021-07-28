import { CLIENT_CONTAINER_ID } from '@shuvi/shared/lib/constants';
// renderer must be imported before application
// we need to init init renderer before import AppComponent
import { view } from '@shuvi/app/core/platform';
import { create } from '@shuvi/app/core/client/application';
import { getAppData } from '../../helper/getAppData';
import { IRouter } from '@shuvi/router/lib/types';
const appData = getAppData();
const {
  router: { history: historyMode },
  routeProps = {}
} = appData;

const app = create(
  {
    pageData: appData.pageData || {},
    routeProps,
    historyMode
  },
  {
    async render({ appContext, AppComponent, router }) {
      const appContainer = document.getElementById(CLIENT_CONTAINER_ID)!;
      if (!router) {
        throw new Error('router not exist');
      }
      view.renderApp({
        AppComponent: AppComponent,
        router: router as IRouter,
        appData,
        appContainer,
        appContext
      });
    }
  }
);

const rerender = () => {
  app.rerender();
};

export { app, rerender };
