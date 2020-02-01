/// <reference lib="dom" />
import { bootstrap } from "@shuvi-app/bootstrap";
import { CLIENT_CONTAINER_ID } from "../shared/constants";
import initWebpackHMR from "./dev/webpackHotDevClient";
import { getAppData } from "./helpers/getAppData";

// type Comp = any;
// const shuvi: ShuviGlobal = (window as any)[CLIENT_GLOBAL_NAME];

initWebpackHMR();
bootstrap({
  appData: getAppData(),
  appContainer: document.getElementById(CLIENT_CONTAINER_ID)!
});
