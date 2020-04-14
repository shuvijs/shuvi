/// <reference lib="dom" />
import { bootstrap } from '@shuvi/app/core/bootstrap';
import App from '@shuvi/app/core/app';
import {
  CLIENT_CONTAINER_ID,
  DEV_STYLE_HIDE_FOUC,
  DEV_STYLE_PREPARE,
} from '@shuvi/shared/lib/constants';
import initWebpackHMR from './dev/webpackHotDevClient';

// reduce FOUC caused by style-loader
const styleReady = new Promise((resolve) => {
  (window.requestAnimationFrame || setTimeout)(async () => {
    await (window as any)[DEV_STYLE_PREPARE];
    document
      .querySelectorAll(`[${DEV_STYLE_HIDE_FOUC}]`)
      .forEach((el) => el.parentElement?.removeChild(el));
    resolve();
  });
});

styleReady!.then(() => {
  const appContainer = document.getElementById(CLIENT_CONTAINER_ID)!;

  initWebpackHMR();
  bootstrap({
    appContainer,
    AppComponent: App,
  });

  // @ts-ignore
  if (module.hot) {
    // @ts-ignore
    module.hot.accept('@shuvi/app/core/app', () => {
      const { App } = require('@shuvi/app/core/app');
      bootstrap({
        appContainer,
        AppComponent: App,
      });
    });
  }
});
