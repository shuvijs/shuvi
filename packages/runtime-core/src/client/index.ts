import { setRuntimeConfig } from "@shuvi/app/config";
import { getAppData } from "./getAppData";

const appData = getAppData();

setRuntimeConfig(() => appData.runtimeConfig || {});

if (process.env.NODE_ENV === "development") {
  require("./index.dev");
} else {
  require("./index.prod");
}
