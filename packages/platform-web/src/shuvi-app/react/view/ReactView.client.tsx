import * as React from 'react';
import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import { Router } from '@shuvi/router-react';
import {
  getErrorModel,
  IAppComponent
} from '@shuvi/platform-shared/esm/runtime';
import AppContainer from '../AppContainer';
import { HeadManager, HeadManagerContext } from '../head';
import Loadable from '../loadable';
import { IReactClientView } from '../types';
import ErrorPage from '../ErrorPage';
import { ErrorBoundary } from './ErrorBoundary';
import { renderAction } from './render-action';

const headManager = new HeadManager();

export class ReactClientView implements IReactClientView {
  private _isInitialRender: boolean = true;

  renderApp: IReactClientView['renderApp'] = async ({
    appContainer,
    AppComponent,
    appData,
    router,
    appContext,
    modelManager
  }) => {
    const { _isInitialRender: isInitialRender } = this;
    let { ssr, dynamicIds } = appData;
    // For e2e test
    if ((window as any).__SHUVI) {
      (window as any).__SHUVI.router = router;
    } else {
      (window as any).__SHUVI = { router };
    }

    const error = getErrorModel(modelManager);

    const TypedAppComponent =
      AppComponent as IAppComponent<React.ComponentType>;

    if (ssr) {
      await Loadable.preloadReady(dynamicIds);
      await router.ready;
    } else {
      await router.ready;
      if (!router.current.matches) {
        // no handler no matches
        error.error(SHUVI_ERROR_CODE.PAGE_NOT_FOUND);
      }
    }

    const root = (
      <ErrorBoundary>
        <HeadManagerContext.Provider value={headManager.updateHead}>
          <Router router={router}>
            <AppContainer
              appContext={appContext}
              modelManager={modelManager}
              errorComp={ErrorPage}
            >
              <TypedAppComponent />
            </AppContainer>
          </Router>
        </HeadManagerContext.Provider>
      </ErrorBoundary>
    );

    const afterRender = () => {
      this._isInitialRender = false;
    };

    renderAction({
      ssr,
      isInitialRender,
      root,
      callback: afterRender,
      appContainer
    });
  };
}
