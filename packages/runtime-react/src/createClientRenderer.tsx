/// <reference path="../client-env.d.ts" />

import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { Runtime } from '@shuvi/types';
import { History } from './router/history';
import { setHistory } from './router/router';
import AppContainer from './AppContainer';
import { IReactAppData } from './types';
import { HeadManager, HeadManagerContext } from './head';
import Loadable from './loadable';
import { createRedirector } from './utils/createRedirector';

const headManager = new HeadManager();

type HistoryCreator = (options: { basename: string }) => History;

// TODO: config basename

export function createClientRenderer({
  historyCreator
}: {
  historyCreator: HistoryCreator;
}): Runtime.IClientRenderer<IReactAppData> {
  let isInitialRender: Boolean = true;

  // TODO: config basename
  const history = historyCreator({ basename: '/' });
  setHistory(history);

  return async ({ appContainer, AppComponent, appData }) => {
    const redirector = createRedirector();
    const TypedAppComponent = AppComponent as Runtime.IAppComponent<
      React.ComponentType
    >;
    let { ssr, appProps, dynamicIds, routeProps } = appData;

    if (ssr) {
      await Loadable.preloadReady(dynamicIds);
    } else if (TypedAppComponent.getInitialProps) {
      appProps = await TypedAppComponent.getInitialProps({
        isServer: false,
        pathname: history.location.pathname,
        redirect: redirector.handler,
        async fetchInitialProps() {
          // do nothing
        }
      });
    }

    if (redirector.redirected) {
      history.push(redirector.state!.path);
    }

    const root = (
      <Router history={history}>
        <HeadManagerContext.Provider value={headManager.updateHead}>
          <AppContainer routeProps={routeProps}>
            <TypedAppComponent {...appProps} />
          </AppContainer>
        </HeadManagerContext.Provider>
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
