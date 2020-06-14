/// <reference lib="dom" />
import { Runtime } from '@shuvi/types';
import { renderer } from '@shuvi/app/core/renderer';
import AppComponent from '@shuvi/app/core/app';
import routes from '@shuvi/app/core/routes';
import { CLIENT_CONTAINER_ID } from '@shuvi/shared/lib/constants';
import { getAppData } from './lib/getAppData';

export function render(options: Partial<Runtime.IClientRendererOptions> = {}) {
  const appData = options.appData || getAppData();
  const appContainer =
    options.appContainer || document.getElementById(CLIENT_CONTAINER_ID)!;

  renderer({
    AppComponent: options.AppComponent || AppComponent,
    routes: options.routes || routes,
    appData,
    appContainer,
    appContext: {} // todo: get appContext from app
  });

  // @ts-ignore
  if (module.hot) {
    // @ts-ignore
    module.hot.accept(['@shuvi/app/core/app', '@shuvi/app/core/routes'], () => {
      const AppComponent = require('@shuvi/app/core/app').default;
      const routes = require('@shuvi/app/core/routes').default;

      renderer({
        AppComponent: options.AppComponent || AppComponent,
        routes: options.routes || routes,
        appData,
        appContainer,
        appContext: {} // todo: get appContext from app
      });
    });
  }
}
