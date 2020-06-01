/// <reference lib="dom" />
import { Runtime } from '@shuvi/types';
import { renderer } from '@shuvi/app/core/renderer';
import App from '@shuvi/app/core/app';
import routes from '@shuvi/app/core/routes';
import { CLIENT_CONTAINER_ID } from '@shuvi/shared/lib/constants';
import { getAppData } from './lib/getAppData';

export function render(options: Partial<Runtime.IClientRendererOptions> = {}) {
  const appData = options.appData || getAppData();
  const appContainer =
    options.appContainer || document.getElementById(CLIENT_CONTAINER_ID)!;

  renderer({
    App: options.App || App,
    routes: options.routes || routes,
    appData,
    appContainer
  });

  // @ts-ignore
  if (module.hot) {
    // @ts-ignore
    module.hot.accept(['@shuvi/app/core/app', '@shuvi/app/core/routes'], () => {
      const App = require('@shuvi/app/core/app').default;
      const routes = require('@shuvi/app/core/routes').default;

      renderer({
        appContainer,
        App,
        routes,
        appData,
        ...options
      });
    });
  }
}
