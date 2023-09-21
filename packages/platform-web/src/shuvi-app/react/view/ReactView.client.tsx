import * as React from 'react';
import { SHUVI_ERROR } from '@shuvi/shared/constants';
import { CLIENT_ENTRY } from '@shuvi/shared/constants/trace';
import { Router } from '@shuvi/router-react';
import AppContainer from '../AppContainer';
import { HeadManager, HeadManagerContext } from '../head';
import Loadable from '../loadable';
import { IReactClientView } from '../types';
import { doRender } from './render';
import { clientEntryTrace } from '../../entry/client/trace';
import { Trace } from '../Trace';

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
    const shouldHydrate = ssr && isInitialRender;

    const TypedAppComponent = AppComponent as React.ComponentType;

    if (ssr && isInitialRender) {
      if (process.env.NODE_ENV === 'development') {
        const { getServerError } = require('@shuvi/error-overlay');
        if (appError && appError.source === 'server') {
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
            error.name = appError.error?.name ?? '';
            error.stack = appError.error?.stack;
            throw getServerError(error);
          });
        }
      }

      await Promise.all([Loadable.preloadReady(dynamicIds), router.ready]);
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
            <Trace>
              <TypedAppComponent />
            </Trace>
          </HeadManagerContext.Provider>
        </AppContainer>
      </Router>
    );

    clientEntryTrace
      .traceChild(CLIENT_ENTRY.events.SHUVI_CLIENT_DO_RENDER.name)
      .traceFn(() => {
        doRender(
          {
            root,
            appContainer,
            shouldHydrate
          },
          () => {
            this._isInitialRender = false;
          }
        );
      });
  };
}
