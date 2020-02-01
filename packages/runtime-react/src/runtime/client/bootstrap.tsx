/// <reference path="../../../client-env.d.ts" />

import React from "react";
import ReactDom from "react-dom";
import * as Runtime from "@shuvi/types/runtime";
import { BrowserRouter } from "react-router-dom";
import App from "../shared/app";
import Loadable from "../../loadable/";

export const bootstrap: Runtime.Bootstrap = async ({
  appData,
  appContainer
}) => {
  await Loadable.preloadReady(appData.dynamicIds);

  return ReactDom.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    appContainer
  );
};
