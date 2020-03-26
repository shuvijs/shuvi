/// <reference lib="dom" />

import { bootstrap } from "@shuvi/app/core/bootstrap";
import { App } from "@shuvi/app/core/app";
import { CLIENT_CONTAINER_ID } from "@shuvi/shared/lib/constants";
import { getAppData } from "./getAppData";

bootstrap({
  AppComponent: App,
  appData: getAppData(),
  appContainer: document.getElementById(CLIENT_CONTAINER_ID)!
});
