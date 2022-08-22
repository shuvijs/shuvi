import * as React from 'react';
import { SHUVI_ERROR } from '@shuvi/shared/lib/constants';
import { Router } from '@shuvi/router-react';
import { getServerError } from '@shuvi/error-overlay';
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
    const {
      router,
      appComponent: AppComponent,
      setError: setAppError,
      error: appError
    } = app;
    let { ssr, dynamicIds } = appData;
    // For e2e test
    if ((window as any).__SHUVI) {
      (window as any).__SHUVI.router = router;
    } else {
      (window as any).__SHUVI = { router };
    }

    if (appError && process.env.NODE_ENV === 'development') {
      setAppError(appError);
      setTimeout(() => {
        let error;
        try {
          // Generate a new error object. We `throw` it because some browsers
          // will set the `stack` when thrown, and we want to ensure ours is
          // not overridden when we re-throw it below.
          throw new Error(appError.message);
        } catch (e) {
          error = e as Error;
        }
        error.name = appError.name ?? '';
        error.stack = appError.stack;
        throw getServerError(error);
      });
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
        setAppError(SHUVI_ERROR.PAGE_NOT_FOUND);
      }
    }

    const root = (
      <Router router={router}>
        <AppContainer app={app}>
          <HeadManagerContext.Provider value={headManager.updateHead}>
            <TypedAppComponent />
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
