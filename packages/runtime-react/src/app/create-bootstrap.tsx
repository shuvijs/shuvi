/// <reference path="../../client-env.d.ts" />

import React from "react";
import ReactDom from "react-dom";
import { Router } from "@shuvi/runtime-react/dep/react-router-dom";
import { Runtime } from "@shuvi/core/types";
import { History } from "@shuvi/runtime-react/lib/runtime/router/history";
// @ts-ignore
import { setHistory } from "@shuvi/runtime-react/lib/runtime/router/router";
import { App } from "./app";

type HistoryCreator = (options: { basename: string }) => History;

export function createBootstrap({
  historyCreator
}: {
  historyCreator: HistoryCreator;
}): Runtime.Bootstrap {
  // TODO: config basename
  const history = historyCreator({ basename: "/" });
  setHistory(history);

  return async ({ appData, appContainer }) => {
    return ReactDom.render(
      <Router history={history}>
        <App routeProps={appData.routeProps} />
      </Router>,
      appContainer
    );
  };
}
