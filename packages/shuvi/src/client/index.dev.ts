/// <reference lib="dom" />
import { bootstrap } from "@shuvi-app/bootstrap";
import { DEV_STYLE_ANCHOR_ID } from "@shuvi/shared/lib/constants";
import { CLIENT_CONTAINER_ID } from "../shared/constants";
import initWebpackHMR from "./dev/webpackHotDevClient";
import { getAppData } from "./helpers/getAppData";

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
  initWebpackHMR();
  bootstrap({
    appData: getAppData(),
    appContainer: document.getElementById(CLIENT_CONTAINER_ID)!
  });
});
