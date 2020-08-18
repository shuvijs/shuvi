import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from '@shuvi/router-react';
import { matchRoutes } from '@shuvi/core/lib/app/app-modules/matchRoutes';
import { Runtime } from '@shuvi/types';
import { History, createRouter, IRouter } from '@shuvi/router';
import AppContainer from '../AppContainer';
import { HeadManager, HeadManagerContext } from '../head';
import Loadable from '../loadable';
import { createRedirector } from '../utils/createRedirector';
import { IReactClientView, IReactAppData, IRoute } from '../types';
import ClientErrorBoundary from '../ClientErrorBoundary';

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
  private _router: IRouter;
  private _isInitialRender: boolean = true;

  constructor(historyCreator: HistoryCreator) {
    this._history = historyCreator();
    this._router = createRouter(this._history);
    // For e2e test
    if ((window as any).__SHUVI) {
      (window as any).__SHUVI.router = this._router;
    } else {
      (window as any).__SHUVI = { router: this._router };
    }
  }

  renderApp: IReactClientView['renderApp'] = async ({
    appContainer,
    AppComponent,
    ErrorComponent,
    appData,
    routes,
    appContext
  }) => {
    const { _history: history } = this;
    const redirector = createRedirector();
    const TypedAppComponent = AppComponent as Runtime.IAppComponent<
      React.ComponentType
    >;
    let { ssr, appProps, dynamicIds, routeProps } = appData;

    if (ssr) {
      await Loadable.preloadReady(dynamicIds);
    } else if (TypedAppComponent.getInitialProps) {
      const { pathname, query } = history.location;

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

    this._renderWithContainer({
      AppComponent,
      ErrorComponent,
      appContainer,
      appData,
      appContext,
      routes,
      children: (
        <AppContainer
          routes={routes}
          routeProps={routeProps}
          appContext={appContext}
        >
          <TypedAppComponent {...appProps} />
        </AppContainer>
      )
    });
  };
  renderError: IReactClientView['renderError'] = async ({
    AppComponent,
    appContainer,
    appData,
    appContext,
    ErrorComponent,
    routes,
    error
  }) => {
    const { _history: history } = this;
    let { ssr, errorProps, dynamicIds } = appData;
    const TypedErrorComponent = ErrorComponent as Runtime.IErrorComponent<
      React.ComponentType
    >;
    const redirector = createRedirector();
    if (ssr) {
      await Loadable.preloadReady(dynamicIds);
    } else if (TypedErrorComponent.getInitialProps) {
      const { pathname, query } = history.location;
      errorProps = await TypedErrorComponent.getInitialProps({
        isServer: false,
        pathname,
        query,
        params: {},
        redirect: redirector.handler,
        appContext
      });
    }

    if (redirector.redirected) {
      history.push(redirector.state!.path);
    }

    this._renderWithContainer({
      AppComponent,
      ErrorComponent,
      appContainer,
      appData,
      appContext,
      routes,
      children: <ErrorComponent {...errorProps} error={error} />
    });
  };

  private async _renderWithContainer({
    AppComponent,
    ErrorComponent,
    appContainer,
    appData,
    appContext,
    children,
    routes
  }: {
    AppComponent: React.ComponentType;
    ErrorComponent: React.ComponentType;
    appContainer: HTMLElement;
    appData: Runtime.IAppData<IReactAppData>;
    routes: IRoute[];
    appContext: Record<string, any>;
    children: React.ReactNode;
  }) {
    const { _isInitialRender: isInitialRender } = this;

    const root = (
      <ClientErrorBoundary
        onError={error => {
          this.renderError({
            appContainer,
            appData,
            appContext,
            AppComponent,
            ErrorComponent,
            routes,
            error
          });
        }}
      >
        <Router router={this._router}>
          <HeadManagerContext.Provider value={headManager.updateHead}>
            {children}
          </HeadManagerContext.Provider>
        </Router>
      </ClientErrorBoundary>
    );

    if (appData.ssr && isInitialRender) {
      ReactDOM.hydrate(root, appContainer);
      this._isInitialRender = false;
    } else {
      ReactDOM.render(root, appContainer);
    }
  }
}
