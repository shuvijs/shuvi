import { create } from '@shuvi/app/core/application';
import { renderer } from '@shuvi/app/core/renderer';
import { CLIENT_CONTAINER_ID } from '@shuvi/shared/lib/constants';
import { getAppData } from './lib/getAppData';

const app = create(
  {},
  {
    async render({ appContext, AppComponent, routes }) {
      const appData = getAppData();
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
