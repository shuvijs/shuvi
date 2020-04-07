/// <reference path="../client-env.d.ts" />

import React from "react";
import ReactDOM from "react-dom";
import { Router } from "@shuvi/runtime-react/dep/react-router-dom";
import { getAppData } from "@shuvi/app";
import { Runtime } from "@shuvi/types";
import { History } from "./router/history";
import { setHistory } from "./router/router";
import AppContainer from "./AppContainer";
import { IReactAppData } from "./types";
import { HeadManager, HeadManagerContext } from "./head";
import Loadable from "./loadable";

const appData = getAppData() as Runtime.IAppData<IReactAppData>;
const headManager = new HeadManager();

type HistoryCreator = (options: { basename: string }) => History;

// TODO: config basename

export function createBootstrap({
  historyCreator
}: {
  historyCreator: HistoryCreator;
}): Runtime.IBootstrap {
  let isInitialRender: Boolean = true;

  // TODO: config basename
  const history = historyCreator({ basename: "/" });
  setHistory(history);

  return async ({ appContainer, AppComponent }) => {
    const TypedAppComponent = AppComponent as Runtime.IAppComponent<
      React.ComponentType
    >;
    let { ssr, appProps, dynamicIds, routeProps } = appData;

    if (ssr) {
      await Loadable.preloadReady(dynamicIds);
    } else if (TypedAppComponent.getInitialProps) {
      appProps = await TypedAppComponent.getInitialProps({
        isServer: false
      });
    }

    const root = (
      <Router history={history}>
        <AppContainer routeProps={routeProps}>
          <HeadManagerContext.Provider value={headManager.updateHead}>
            <TypedAppComponent {...appProps} />
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
