import { CLIENT_CONTAINER_ID } from '@shuvi/shared/lib/constants';
// renderer must be imported before application
// we need to init init renderer before import AppComponent
import { renderer } from '@shuvi/app/core/renderer';
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

      renderer({
        AppComponent: AppComponent,
        routes,
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
