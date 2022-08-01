/// <reference lib="dom" />
import {
  DEV_STYLE_HIDE_FOUC,
  DEV_STYLE_PREPARE
} from '@shuvi/shared/lib/constants';
import { initHMRAndDevClient } from '../../dev';
import { run, app } from './app';

async function init() {
  initHMRAndDevClient(app);
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

init().then(() => run());
