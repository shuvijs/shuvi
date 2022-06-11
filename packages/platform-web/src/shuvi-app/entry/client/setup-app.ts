import { CLIENT_CONTAINER_ID } from '@shuvi/shared/lib/constants';
// renderer must be imported before application
// we need to init init renderer before import AppComponent
import { view } from '@shuvi/app/core/platform';
import { IRouter } from '@shuvi/router';
import {
  getAppData,
  IPageRouteRecord
} from '@shuvi/platform-shared/esm/runtime';
import { createApp } from '../../create-app/client';

const appData = getAppData();

const app = createApp({
  async render({ appContext, AppComponent, router = [], modelManager }) {
    const appContainer = document.getElementById(CLIENT_CONTAINER_ID)!;
    view.renderApp({
      AppComponent,
      router: router as IRouter<IPageRouteRecord>,
      appData,
      appContainer,
      appContext,
      modelManager
    });
  },
  appData
});

const rerender = () => {
  app.rerender();
};

export { app, rerender };
