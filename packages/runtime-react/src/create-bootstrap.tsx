/// <reference path="../client-env.d.ts" />

import React from "react";
import ReactDOM from "react-dom";
import { Router } from "@shuvi/runtime-react/dep/react-router-dom";
import { Runtime } from "@shuvi/types";
import { History } from "./router/history";
import { setHistory } from "./router/router";
import AppContainer from "./AppContainer";
import { IReactAppData } from "./types";
import { HeadManager, HeadManagerContext } from "./head";

const headManager = new HeadManager();

type HistoryCreator = (options: { basename: string }) => History;

export function createBootstrap({
  historyCreator,
  ssr = false
}: {
  historyCreator: HistoryCreator;
  ssr?: boolean;
}): Runtime.IBootstrap<IReactAppData> {
  let isInitialRender: Boolean = true;
  // TODO: config basename
  const history = historyCreator({ basename: "/" });
  setHistory(history);

  return async ({ appData, appContainer, AppComponent }) => {
    const root = (
      <Router history={history}>
        <AppContainer routeProps={appData.routeProps}>
          <HeadManagerContext.Provider value={headManager.updateHead}>
            <AppComponent {...appData.appProps} />
          </HeadManagerContext.Provider>
        </AppContainer>
      </Router>
    );

    if (ssr && isInitialRender) {
      ReactDOM.hydrate(root, appContainer);
      isInitialRender = false;
    } else {
      ReactDOM.render(root, appContainer);
    }
  };
}
