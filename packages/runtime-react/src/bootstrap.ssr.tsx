/// <reference path="../client-env.d.ts" />

import { Runtime } from "@shuvi/types";
import { IReactAppData } from "./types";
import Loadable from "./loadable";
import { createBrowserHistory } from "./router/history";
// @ts-ignore
import { createBootstrap } from "./create-bootstrap";

const innner = createBootstrap({
  historyCreator: createBrowserHistory,
  ssr: true
});

export const bootstrap: Runtime.IBootstrap<IReactAppData> = async options => {
  await Loadable.preloadReady(options.appData.dynamicIds);

  return await innner(options);
};
