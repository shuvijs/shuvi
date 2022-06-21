import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { Router } from '@shuvi/router-react';
import { IHtmlTag } from '@shuvi/platform-shared/esm/runtime';
import { LoadableContext } from '../loadable';
import AppContainer from '../AppContainer';
import ErrorPage from '../ErrorPage';
import { IReactServerView, IReactAppData } from '../types';
import { Head } from '../head';
import Loadable from '../loadable';
import { ErrorBoundary } from './ErrorBoundary';

export class ReactServerView implements IReactServerView {
  renderApp: IReactServerView['renderApp'] = async ({
    AppComponent,
    router,
    appContext,
    modelManager,
    manifest,
    getAssetPublicUrl
  }) => {
    await Loadable.preloadAll();

    const loadableModules: string[] = [];
    let htmlContent: string;
    let head: IHtmlTag[];

    const RootApp = (
      <ErrorBoundary>
        <Router static router={router}>
          <LoadableContext.Provider
            value={moduleName => loadableModules.push(moduleName)}
          >
            <AppContainer
              appContext={appContext}
              modelManager={modelManager}
              errorComp={ErrorPage}
            >
              <AppComponent />
            </AppContainer>
          </LoadableContext.Provider>
        </Router>
      </ErrorBoundary>
    );

    try {
      htmlContent = renderToString(RootApp);
    } finally {
      head = Head.rewind() || [];
    }

    const { loadble } = manifest;
    const dynamicImportIdSet = new Set<string>();
    const dynamicImportChunkSet = new Set<string>();
    for (const mod of loadableModules) {
      const manifestItem = loadble[mod];
      if (manifestItem) {
        manifestItem.files.forEach(file => {
          dynamicImportChunkSet.add(file);
        });
        manifestItem.children.forEach(item => {
          dynamicImportIdSet.add(item.id as string);
        });
      }
    }

    const preloadDynamicChunks: IHtmlTag<'link'>[] = [];
    const styles: IHtmlTag<'link'>[] = [];
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
      } else if (/\.css$/.test(file)) {
        styles.push({
          tagName: 'link',
          attrs: {
            rel: 'stylesheet',
            href: getAssetPublicUrl(file)
          }
        });
      }
    }
    const appData: IReactAppData = {
      dynamicIds: [...dynamicImportIdSet]
    };
    if (dynamicImportIdSet.size) {
      appData.dynamicIds = Array.from(dynamicImportIdSet);
    }

    return {
      appData,
      appHtml: htmlContent,
      htmlAttrs: {},
      headBeginTags: [...head, ...preloadDynamicChunks],
      headEndTags: [...styles],
      bodyBeginTags: [],
      bodyEndTags: []
    };
  };
}
