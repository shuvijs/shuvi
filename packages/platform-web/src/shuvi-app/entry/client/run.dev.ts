/// <reference lib="dom" />
import { DEV_STYLE_HIDE_FOUC } from '@shuvi/shared/lib/constants';
import { initHMRAndDevClient } from '../../dev';
import { run, app } from './app';

function applyStyle() {
  document
    .querySelectorAll(`[${DEV_STYLE_HIDE_FOUC}]`)
    .forEach(el => el.parentElement?.removeChild(el));
}

async function init() {
  initHMRAndDevClient(app);
}

init()
  .then(() => run())
  .finally(() => {
    // reduce FOUC caused by style-loader
    applyStyle();
  });
