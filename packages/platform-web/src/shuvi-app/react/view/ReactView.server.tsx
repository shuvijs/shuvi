import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { redirect } from '@shuvi/platform-shared/shared';
import { SHUVI_ERROR } from '@shuvi/shared/constants';
import { Router } from '@shuvi/router-react';
import logger from '@shuvi/utils/logger';
import { IHtmlTag } from '../../../shared';
import Loadable, { LoadableContext } from '../loadable';
import AppContainer from '../AppContainer';
import { IReactServerView, IReactAppData } from '../types';
import { Head } from '../head';
import { serializeServerError } from '../../helper/serializeServerError';
import isThirdSite from '../../helper/isThirdSite';

export class ReactServerView implements IReactServerView {
  renderApp: IReactServerView['renderApp'] = async ({ req, app, manifest }) => {
    await Loadable.preloadAll();

    const { router, appComponent: AppComponent, setError: setAppError } = app;
    await router.ready;

    // todo: move these into renderer
    let { matches, redirected, state, pathname } = router.current;
    // handler no matches
    if (!matches.length) {
      setAppError(SHUVI_ERROR.PAGE_NOT_FOUND);
    }

    if (redirected) {
      // handel loader redirect
      if (
        state &&
        typeof (state as { location: string }).location === 'string'
      ) {
        const { location, status } = state as {
          location: string;
          status: number;
        };
        return redirect(
          isThirdSite(location)
            ? location
            : router.resolve(location, pathname).href,
          status
        );
      }
      // handle router internal redirect
      return redirect(pathname);
    }

    const loadableModules: string[] = [];
    let htmlContent: string | undefined = undefined;
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
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        logger.error(error.stack);
      }
      setAppError(serializeServerError(error));
      htmlContent = renderToString(RootApp); // Consistency on both server and client side
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
      // Safari Bug: https://bugs.webkit.org/show_bug.cgi?id=187726
      // If a request is preloaded, Safari will always retrieve it from the
      // cache, regardless of the cache headers for that request.
      // disable preload for safari on dev
      if (process.env.NODE_ENV === 'development') {
        const ua = req.headers['user-agent'] || '';
        if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
          if (/\.js$/.test(file)) {
            continue;
          }
        }
      }

      if (/\.js$/.test(file)) {
        preloadDynamicChunks.push({
          tagName: 'link',
          attrs: {
            rel: 'preload',
            href: req.getAssetUrl(file),
            as: 'script'
          }
        });
      } else if (/\.css$/.test(file)) {
        styles.push({
          tagName: 'link',
          attrs: {
            rel: 'stylesheet',
            href: req.getAssetUrl(file)
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
      content: htmlContent,
      htmlAttrs: {},
      headBeginTags: [...head, ...preloadDynamicChunks],
      headEndTags: [...styles],
      bodyBeginTags: [],
      bodyEndTags: []
    };
  };
}
