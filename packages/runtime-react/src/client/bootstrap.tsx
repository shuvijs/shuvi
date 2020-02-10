/// <reference path="../../client-env.d.ts" />

import React from "react";
import ReactDom from "react-dom";
import * as Runtime from "@shuvi/types/runtime";
import { Router } from "react-router-dom";
import Loadable from "@shuvi/runtime-react/lib/runtime/loadable";
import { createBrowserHistory } from "@shuvi/runtime-react/lib/runtime/router/history";
// @ts-ignore
import { setHistory } from "@shuvi/runtime-react/lib/runtime/router/router";
import App from "./app";

export const bootstrap: Runtime.Bootstrap = async ({
  appData,
  appContainer
}) => {
  await Loadable.preloadReady(appData.dynamicIds);

  // TODO: hash history(tree shaking)
  // TODO: config basename
  const history = createBrowserHistory({ basename: "/" });
  setHistory(history);

  return ReactDom.render(
    <Router history={history}>
      <App />
    </Router>,
    appContainer
  );
};
