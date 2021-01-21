/// <reference lib="dom" />
import {
  DEV_STYLE_HIDE_FOUC,
  DEV_STYLE_PREPARE
} from '@shuvi/shared/lib/constants';
import initWebpackHMR from './dev/webpackHotDevClient';
import { app } from './setup-app';

async function init() {
  initWebpackHMR();
  // reduce FOUC caused by style-loader
  const styleReady = new Promise<void>(resolve => {
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

init().then(() => app.run());
