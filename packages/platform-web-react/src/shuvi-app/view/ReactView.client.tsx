import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from '@shuvi/router-react';
import { createRedirector } from '@shuvi/router';
import { Runtime } from '@shuvi/types';
import AppContainer from '../AppContainer';
import { HeadManager, HeadManagerContext } from '../head';
import Loadable from '../loadable';
import { IReactClientView } from '../types';

const headManager = new HeadManager();

export class ReactClientView implements IReactClientView {
  private _isInitialRender: boolean = true;

  renderApp: IReactClientView['renderApp'] = async ({
    appContainer,
    AppComponent,
    appData,
    router,
    appContext
  }) => {
    const { _isInitialRender: isInitialRender } = this;
    let { ssr, appProps, dynamicIds } = appData;
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

    if (ssr) {
      await Loadable.preloadReady(dynamicIds);
    } else {
      await router.ready;
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

    const root = (
      <Router router={router}>
        <HeadManagerContext.Provider value={headManager.updateHead}>
          <AppContainer appContext={appContext}>
            <TypedAppComponent {...appProps} />
          </AppContainer>
        </HeadManagerContext.Provider>
      </Router>
    );
    console.warn('render', appContainer);
    if (ssr && isInitialRender) {
      ReactDOM.hydrate(root, appContainer);
      this._isInitialRender = false;
    } else {
      ReactDOM.render(root, appContainer);
    }
  };
}
