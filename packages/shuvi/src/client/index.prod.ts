/// <reference lib="dom" />

import { bootstrap } from "@shuvi-app/bootstrap";
import { CLIENT_CONTAINER_ID } from "../shared/constants";
import { getAppData } from "./helpers/getAppData";

bootstrap({
  appData: getAppData(),
  appContainer: document.getElementById(CLIENT_CONTAINER_ID)!
});
