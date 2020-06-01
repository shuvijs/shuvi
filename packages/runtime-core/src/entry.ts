/// <reference lib="dom" />
import './public-path';
import './setup';
import { Runtime } from '@shuvi/types';
import { renderer } from '@shuvi/app/core/renderer';
import App from '@shuvi/app/core/app';
import routes from '@shuvi/app/core/routes';
import {
  CLIENT_CONTAINER_ID,
  DEV_STYLE_HIDE_FOUC,
  DEV_STYLE_PREPARE
} from '@shuvi/shared/lib/constants';
import initWebpackHMR from './dev/webpackHotDevClient';
import { router } from '@shuvi/app';
import { getAppData } from './lib/getAppData';

(window as any).__SHUVI = {
  router
};

export async function init() {
  if (process.env.NODE_ENV === 'development') {
    initWebpackHMR();
    // reduce FOUC caused by style-loader
    const styleReady = new Promise(resolve => {
      (window.requestAnimationFrame || setTimeout)(async () => {
        await (window as any)[DEV_STYLE_PREPARE];
        document
          .querySelectorAll(`[${DEV_STYLE_HIDE_FOUC}]`)
          .forEach(el => el.parentElement?.removeChild(el));
        resolve();
      });
    });

    await styleReady!;
  }
}

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
