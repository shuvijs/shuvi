import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import qs from 'querystring';
import { matchRoutes } from '@shuvi/core';
import { Runtime } from '@shuvi/types';
import type { History } from '@shuvi/router';
import AppContainer from '../AppContainer';
import { IRoute } from '../types';
import { HeadManager, HeadManagerContext } from '../head';
import Loadable from '../loadable';
import { createRedirector } from '../utils/createRedirector';
import { IReactClientView } from '../types';

const headManager = new HeadManager();

type HistoryCreator = () => History;

function getRouteParams(routes: IRoute[], pathname: string) {
  const matchedRoutes = matchRoutes(routes, pathname);
  const params: Runtime.IParams = {};
  for (let index = 0; index < matchedRoutes.length; index++) {
    const matchedRoute = matchedRoutes[index];
    Object.assign(params, matchedRoute.params);
  }
  return params;
}

export class ReactClientView implements IReactClientView {
  private _history: History;
  private _isInitialRender: boolean = false;

  constructor(historyCreator: HistoryCreator) {
    this._history = historyCreator();
  }

  renderApp: IReactClientView['renderApp'] = async ({
    appContainer,
    AppComponent,
    appData,
    routes,
    appContext
  }) => {
    const { _history: history, _isInitialRender: isInitialRender } = this;
    const redirector = createRedirector();
    const TypedAppComponent = AppComponent as Runtime.IAppComponent<
      React.ComponentType
    >;
    let { ssr, appProps, dynamicIds, routeProps } = appData;

    if (ssr) {
      await Loadable.preloadReady(dynamicIds);
    } else if (TypedAppComponent.getInitialProps) {
      const { pathname } = history.location;
      const query = qs.parse(history.location.search.slice(1));

      // todo: pass appContext
      appProps = await TypedAppComponent.getInitialProps({
        isServer: false,
        pathname,
        query,
        params: getRouteParams(routes, pathname),
        redirect: redirector.handler,
        appContext,
        async fetchInitialProps() {
          // do nothing
        }
      });
    }

    if (redirector.redirected) {
      history.push(redirector.state!.path);
    }

    const root = (
      // TODO: upgrade to @shuvi/router-react
      // @ts-ignore
      <Router history={history}>
        <HeadManagerContext.Provider value={headManager.updateHead}>
          <AppContainer
            routes={routes}
            routeProps={routeProps}
            appContext={appContext}
          >
            <TypedAppComponent {...appProps} />
          </AppContainer>
        </HeadManagerContext.Provider>
      </Router>
    );

    if (ssr && isInitialRender) {
      ReactDOM.hydrate(root, appContainer);
      this._isInitialRender = false;
    } else {
      ReactDOM.render(root, appContainer);
    }
  };
}
