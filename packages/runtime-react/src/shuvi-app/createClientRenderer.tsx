import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import qs from 'querystring';
import { Runtime } from '@shuvi/types';
import { History } from './router/history';
import { setHistory } from './router/router';
import { matchRoutes } from './router/matchRoutes';
import AppContainer from './AppContainer';
import { IReactAppData, IRoute } from './types';
import { HeadManager, HeadManagerContext } from './head';
import Loadable from './loadable';
import { createRedirector } from './utils/createRedirector';

const headManager = new HeadManager();

type HistoryCreator = (options: { basename: string }) => History;

function getRouteParams(routes: IRoute[], pathname: string) {
  const matchedRoutes = matchRoutes(routes, pathname);
  const params: Runtime.IParams = {};
  for (let index = 0; index < matchedRoutes.length; index++) {
    const { match } = matchedRoutes[index];
    Object.assign(params, match.params);
  }
  return params;
}

export function createClientRenderer({
  historyCreator
}: {
  historyCreator: HistoryCreator;
}): Runtime.IClientRenderer<React.ComponentType, IReactAppData> {
  let isInitialRender: Boolean = true;

  // TODO: config basename
  const history = historyCreator({ basename: '/' });
  setHistory(history);

  return async ({
    appContainer,
    AppComponent,
    appData,
    routes,
    appContext
  }) => {
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
      isInitialRender = false;
    } else {
      ReactDOM.render(root, appContainer);
    }
  };
}
