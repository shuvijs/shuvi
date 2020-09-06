import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from '@shuvi/router-react';
import { Runtime } from '@shuvi/types';
import { History, createRouter } from '@shuvi/router';
import AppContainer from '../AppContainer';
import { HeadManager, HeadManagerContext } from '../head';
import Loadable from '../loadable';
import { createRedirector } from '../utils/createRedirector';
import { normalizeRoutes } from '../utils/router';
import { IReactClientView } from '../types';

const headManager = new HeadManager();

type HistoryCreator = () => History;

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

    const router = createRouter({
      routes: normalizeRoutes(routes),
      history
    });

    // For e2e test
    if ((window as any).__SHUVI) {
      (window as any).__SHUVI.router = router;
    } else {
      (window as any).__SHUVI = { router };
    }

    const redirector = createRedirector();
    const TypedAppComponent = AppComponent as Runtime.IAppComponent<
      React.ComponentType
    >;
    let { ssr, appProps, dynamicIds, routeProps } = appData;

    if (ssr) {
      await Loadable.preloadReady(dynamicIds);
    } else {
      const { pathname, query, params } = router.current;

      if (TypedAppComponent.getInitialProps) {
        appProps = await TypedAppComponent.getInitialProps({
          isServer: false,
          pathname,
          query,
          params,
          redirect: redirector.handler,
          appContext,
          async fetchInitialProps() {
            // do nothing
          }
        });
      }
    }

    if (redirector.redirected) {
      router.replace(redirector.state!.path);
    }

    appContext.isFirstRender = true;

    const removeListener = router.listen(() => {
      appContext.isFirstRender = false;
      removeListener();
    });

    const root = (
      <Router router={router}>
        <HeadManagerContext.Provider value={headManager.updateHead}>
          <AppContainer routeProps={routeProps} appContext={appContext}>
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
