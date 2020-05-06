import "./public-path";
import { setRuntimeConfig, router } from "@shuvi/app";
import { getAppData } from "./lib/getAppData";

const appData = getAppData();

setRuntimeConfig(appData.runtimeConfig || {});

(window as any).__SHUVI = {
  router
};

if (process.env.NODE_ENV === "development") {
  require("./index.dev");
} else {
  require("./index.prod");
}
