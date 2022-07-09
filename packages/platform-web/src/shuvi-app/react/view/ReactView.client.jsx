var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as React from 'react';
import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import { Router } from '@shuvi/router-react';
import { getErrorHandler } from '@shuvi/platform-shared/shared';
import AppContainer from '../AppContainer';
import { HeadManager, HeadManagerContext } from '../head';
import Loadable from '../loadable';
import ErrorPage from '../ErrorPage';
import { ErrorBoundary } from './ErrorBoundary';
import { renderAction } from './render-action';
const headManager = new HeadManager();
export class ReactClientView {
    constructor() {
        this._isInitialRender = true;
        this.renderApp = ({ appContainer, app, appData }) => __awaiter(this, void 0, void 0, function* () {
            const { _isInitialRender: isInitialRender } = this;
            const { modelManager, router, appComponent: AppComponent, context: appContext } = app;
            let { ssr, appProps, dynamicIds } = appData;
            // For e2e test
            if (window.__SHUVI) {
                window.__SHUVI.router = router;
            }
            else {
                window.__SHUVI = { router };
            }
            const error = getErrorHandler(modelManager);
            const TypedAppComponent = AppComponent;
            if (ssr) {
                yield Loadable.preloadReady(dynamicIds);
                yield router.ready;
            }
            else {
                yield router.ready;
                const { matches } = router.current;
                if (!matches.length) {
                    // no handler no matches
                    error.errorHandler({
                        code: SHUVI_ERROR_CODE.PAGE_NOT_FOUND
                    });
                }
            }
            const root = (<ErrorBoundary>
        <HeadManagerContext.Provider value={headManager.updateHead}>
          <Router router={router}>
            <AppContainer appContext={appContext} modelManager={modelManager} errorComp={ErrorPage}>
              <TypedAppComponent {...appProps}/>
            </AppContainer>
          </Router>
        </HeadManagerContext.Provider>
      </ErrorBoundary>);
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
        });
    }
}
