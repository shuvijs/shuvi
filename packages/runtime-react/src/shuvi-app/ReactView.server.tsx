import React from 'react';
import { renderToString } from 'react-dom/server';
import { Runtime } from '@shuvi/types';
import { Router } from 'react-router-dom';
import { createServerHistory } from './router/history';
import { setHistory } from './router/router';
import Loadable, { LoadableContext } from './loadable';
import AppContainer from './AppContainer';
import { IReactServerView, IReactAppData } from './types';
import { Head } from './head';
import { createRedirector } from './utils/createRedirector';
import { matchRoutes } from './router/matchRoutes';

import IAppComponent = Runtime.IAppComponent;
import IRouteComponent = Runtime.IRouteComponent;
import IHtmlTag = Runtime.IHtmlTag;
import IParams = Runtime.IParams;

export class ReactServerView implements IReactServerView {
  renderApp: IReactServerView['renderApp'] = async ({
    url,
    AppComponent,
    routes,
    appContext,
    manifest,
    getAssetPublicUrl
  }) => {
    await Loadable.preloadAll();

    const redirector = createRedirector();
    const routerContext = {};
    const history = createServerHistory({
      basename: '',
      location: url,
      context: routerContext
    });
    const { pathname, query } = history.location;
    // sethistory before render to make router avaliable
    setHistory(history);

    const routeProps: { [x: string]: any } = {};
    const matchedRoutes = matchRoutes(routes, pathname);
    const pendingDataFetchs: Array<() => Promise<void>> = [];
    const params: IParams = {};
    for (let index = 0; index < matchedRoutes.length; index++) {
      const { route, match } = matchedRoutes[index];
      const comp = route.component as
        | IRouteComponent<React.Component, any>
        | undefined;
      Object.assign(params, match.params);
      if (comp && comp.getInitialProps) {
        pendingDataFetchs.push(async () => {
          const props = await comp.getInitialProps!({
            isServer: true,
            pathname,
            query,
            appContext,
            params: match.params,
            redirect: redirector.handler
          });
          routeProps[route.id] = props || {};
        });
      }
    }
    const fetchInitialProps = async () => {
      await Promise.all(pendingDataFetchs.map(fn => fn()));
    };
    let appInitialProps: { [x: string]: any } | undefined;
    const appGetInitialProps = ((AppComponent as any) as IAppComponent<
      React.Component,
      any
    >).getInitialProps;
    if (appGetInitialProps) {
      appInitialProps = await appGetInitialProps({
        isServer: true,
        pathname,
        query,
        params,
        appContext,
        fetchInitialProps,
        redirect: redirector.handler
      });
    } else {
      await fetchInitialProps();
    }

    if (redirector.redirected) {
      return {
        redirect: redirector.state
      };
    }

    const loadableModules: string[] = [];
    let htmlContent: string;
    let head: IHtmlTag[];
    try {
      htmlContent = renderToString(
        <Router history={history}>
          <LoadableContext.Provider
            value={moduleName => loadableModules.push(moduleName)}
          >
            <AppContainer
              routes={routes}
              routeProps={routeProps}
              appContext={appContext}
            >
              <AppComponent {...appInitialProps} />
            </AppContainer>
          </LoadableContext.Provider>
        </Router>
      );
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
      routeProps,
      dynamicIds: [...dynamicImportIdSet]
    };
    if (appInitialProps) {
      appData.appProps = appInitialProps;
    }
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
