import { CLIENT_CONTAINER_ID } from '@shuvi/shared/lib/constants';
// renderer must be imported before application
// we need to init init renderer before import AppComponent
import { renderer } from '@shuvi/app/core/renderer';
import { create } from '@shuvi/app/core/application';
import { getAppData } from './lib/getAppData';
import { isRoutesMatched } from '@shuvi/core/lib/app/utils';
import { router } from '@shuvi/app';

const appData = getAppData();

const app = create(
  {
    pageData: appData.pageData || {}
  },
  {
    async render({ appContext, AppComponent, routes }) {
      const appContainer = document.getElementById(CLIENT_CONTAINER_ID)!;
      const { pathname } = router.location;

      if (appData.ssr == false && !isRoutesMatched(routes, pathname)) {
        appData.statusCode = 404;
      }

      if (appData.statusCode && appData.statusCode >= 400) {
        renderer.renderError({
          appData,
          appContainer,
          appContext
        });
      } else {
        renderer.renderApp({
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
