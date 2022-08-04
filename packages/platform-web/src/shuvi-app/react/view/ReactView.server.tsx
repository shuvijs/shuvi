import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { getLoaderManager, redirect } from '@shuvi/platform-shared/shared';
import { SHUVI_ERROR } from '@shuvi/shared/lib/constants';
import { Router } from '@shuvi/router-react';
import { IHtmlTag } from '../../../shared';
import Loadable, { LoadableContext } from '../loadable';
import AppContainer from '../AppContainer';
import { IReactServerView, IReactAppData } from '../types';
import { Head } from '../head';

export class ReactServerView implements IReactServerView {
  renderApp: IReactServerView['renderApp'] = async ({
    app,
    manifest,
    getAssetPublicUrl
  }) => {
    const {
      storeManager,
      router,
      error: appError,
      appComponent: AppComponent
    } = app;
    await router.ready;
    await Loadable.preloadAll();

    // todo: move these into renderer
    let { pathname, matches, redirected } = router.current;
    // handler no matches
    if (!matches.length) {
      appError.error(SHUVI_ERROR.PAGE_NOT_FOUND);
    }

    if (redirected) {
      return redirect(pathname);
    }

    // todo: move loader into app, avoid using global module
    const loaderManager = getLoaderManager();
    const loadersData = await loaderManager.getAllData();

    const loadableModules: string[] = [];
    let htmlContent: string;
    let head: IHtmlTag[];

    const RootApp = (
      <Router static router={router}>
        <AppContainer app={app}>
          <LoadableContext.Provider
            value={moduleName => loadableModules.push(moduleName)}
          >
            <AppComponent />
          </LoadableContext.Provider>
        </AppContainer>
      </Router>
    );

    try {
      htmlContent = renderToString(RootApp);
    } finally {
      loaderManager.clearAllData();
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
      dynamicIds: [...dynamicImportIdSet],
      loadersData
    };
    if (dynamicImportIdSet.size) {
      appData.dynamicIds = Array.from(dynamicImportIdSet);
    }

    appData.appState = storeManager.getState();

    return {
      appData,
      content: htmlContent,
      htmlAttrs: {},
      headBeginTags: [...head, ...preloadDynamicChunks],
      headEndTags: [...styles],
      bodyBeginTags: [],
      bodyEndTags: []
    };
  };
}
