import * as React from 'react';
import { SHUVI_ERROR } from '@shuvi/shared/lib/constants';
import { Router } from '@shuvi/router-react';
import AppContainer from '../AppContainer';
import { HeadManager, HeadManagerContext } from '../head';
import Loadable from '../loadable';
import { IReactClientView } from '../types';
import { renderAction } from './render-action';

const headManager = new HeadManager();

export class ReactClientView implements IReactClientView {
  private _isInitialRender: boolean = true;

  renderApp: IReactClientView['renderApp'] = async ({
    appContainer,
    app,
    appData
  }) => {
    const { _isInitialRender: isInitialRender } = this;
    const { router, appComponent: AppComponent, error } = app;
    let { ssr, appProps, dynamicIds } = appData;
    // For e2e test
    if ((window as any).__SHUVI) {
      (window as any).__SHUVI.router = router;
    } else {
      (window as any).__SHUVI = { router };
    }

    const TypedAppComponent = AppComponent as React.ComponentType;

    if (ssr) {
      await Loadable.preloadReady(dynamicIds);
      await router.ready;
    } else {
      await router.ready;
      const { matches } = router.current;

      if (!matches.length) {
        // no handler no matches
        error.error(SHUVI_ERROR.PAGE_NOT_FOUND);
      }
    }

    const root = (
      <Router router={router}>
        <AppContainer app={app}>
          <HeadManagerContext.Provider value={headManager.updateHead}>
            <TypedAppComponent {...appProps} />
          </HeadManagerContext.Provider>
        </AppContainer>
      </Router>
    );

    const ssrCallback = () => {
      this._isInitialRender = false;
    };

    renderAction({
      ssr,
      isInitialRender,
      root,
      callback: ssrCallback,
      appContainer
    });
  };
}
