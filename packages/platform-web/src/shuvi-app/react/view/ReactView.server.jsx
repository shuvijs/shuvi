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
import { renderToString } from 'react-dom/server';
import { SHUVI_ERROR_CODE } from '@shuvi/shared/lib/constants';
import { Router } from '@shuvi/router-react';
import { getErrorHandler, getLoaderManager, redirect } from '@shuvi/platform-shared/shared';
import Loadable, { LoadableContext } from '../loadable';
import AppContainer from '../AppContainer';
import ErrorPage from '../ErrorPage';
import { Head } from '../head';
import { ErrorBoundary } from './ErrorBoundary';
export class ReactServerView {
    constructor() {
        this.renderApp = ({ app, manifest, getAssetPublicUrl }) => __awaiter(this, void 0, void 0, function* () {
            yield Loadable.preloadAll();
            const { modelManager, router, appComponent: AppComponent, context: appContext } = app;
            const error = getErrorHandler(modelManager);
            yield router.ready;
            let { pathname, matches, redirected } = router.current;
            // handler no matches
            if (!matches.length) {
                error.errorHandler({
                    code: SHUVI_ERROR_CODE.PAGE_NOT_FOUND
                });
            }
            if (redirected) {
                return {
                    redirect: redirect(pathname)
                };
            }
            const loaderManager = getLoaderManager();
            const loadersData = yield loaderManager.getAllData();
            const loadableModules = [];
            let htmlContent;
            let head;
            const RootApp = (<ErrorBoundary>
        <Router static router={router}>
          <LoadableContext.Provider value={moduleName => loadableModules.push(moduleName)}>
            <AppContainer appContext={appContext} modelManager={modelManager} errorComp={ErrorPage}>
              <AppComponent />
            </AppContainer>
          </LoadableContext.Provider>
        </Router>
      </ErrorBoundary>);
            try {
                htmlContent = renderToString(RootApp);
            }
            finally {
                loaderManager.clearAllData();
                head = Head.rewind() || [];
            }
            const { loadble } = manifest;
            const dynamicImportIdSet = new Set();
            const dynamicImportChunkSet = new Set();
            for (const mod of loadableModules) {
                const manifestItem = loadble[mod];
                if (manifestItem) {
                    manifestItem.files.forEach(file => {
                        dynamicImportChunkSet.add(file);
                    });
                    manifestItem.children.forEach(item => {
                        dynamicImportIdSet.add(item.id);
                    });
                }
            }
            const preloadDynamicChunks = [];
            const styles = [];
            for (const file of dynamicImportChunkSet) {
                if (/\.js$/.test(file)) {
                    preloadDynamicChunks.push({
                        tagName: 'link',
                        attrs: {
                            rel: 'preload',
                            href: getAssetPublicUrl(file),
                            as: 'script'
                        }
                    });
                }
                else if (/\.css$/.test(file)) {
                    styles.push({
                        tagName: 'link',
                        attrs: {
                            rel: 'stylesheet',
                            href: getAssetPublicUrl(file)
                        }
                    });
                }
            }
            const appData = {
                dynamicIds: [...dynamicImportIdSet],
                loadersData
            };
            if (dynamicImportIdSet.size) {
                appData.dynamicIds = Array.from(dynamicImportIdSet);
            }
            appData.appState = modelManager.getChangedState();
            return {
                appData,
                appHtml: htmlContent,
                htmlAttrs: {},
                headBeginTags: [...head, ...preloadDynamicChunks],
                headEndTags: [...styles],
                bodyBeginTags: [],
                bodyEndTags: []
            };
        });
    }
}
