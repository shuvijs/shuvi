/// <reference lib="dom" />
import { bootstrap } from "@shuvi/app/core/bootstrap";
import { App } from "@shuvi/app/core/app";
import {
  DEV_STYLE_ANCHOR_ID,
  CLIENT_CONTAINER_ID
} from "@shuvi/shared/lib/constants";
import initWebpackHMR from "./dev/webpackHotDevClient";
import { getAppData } from "./getAppData";

// FIXTHIS: this does not work as expected
const styleReady = new Promise(resolve => {
  (window.requestAnimationFrame || setTimeout)(() => {
    const el = document.querySelector(`#${DEV_STYLE_ANCHOR_ID}`)
      ?.previousElementSibling;
    if (el) {
      el.parentNode!.removeChild(el);
    }
    resolve();
  });
});

styleReady!.then(() => {
  const appData = getAppData();
  const appContainer = document.getElementById(CLIENT_CONTAINER_ID)!;

  initWebpackHMR();
  bootstrap({
    appData,
    appContainer,
    AppComponent: App
  });

  // @ts-ignore
  if (module.hot) {
    // @ts-ignore
    module.hot.accept("@shuvi/app/core/app", () => {
      const { App } = require("@shuvi/app/core/app");
      bootstrap({
        appData,
        appContainer,
        AppComponent: App
      });
    });
  }
});
