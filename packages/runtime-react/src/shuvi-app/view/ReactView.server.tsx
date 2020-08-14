import React from 'react';
import { renderToString } from 'react-dom/server';
import { matchRoutes } from '@shuvi/core/lib/app/app-modules/matchRoutes';
import { Runtime } from '@shuvi/types';
import { Router } from '@shuvi/router-react';
import { createServerHistory, createRouter } from '@shuvi/router';
import Loadable, { LoadableContext } from '../loadable';
import AppContainer from '../AppContainer';
import { IReactServerView, IReactAppData } from '../types';
import { Head } from '../head';
import { createRedirector } from '../utils/createRedirector';

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

    const routeProps: { [x: string]: any } = {};
    const matchedRoutes = matchRoutes(routes, pathname);
    const pendingDataFetchs: Array<() => Promise<void>> = [];
    const params: IParams = {};
    for (let index = 0; index < matchedRoutes.length; index++) {
      const matchedRoute = matchedRoutes[index];
      const comp = matchedRoute.route.component as
        | IRouteComponent<React.Component, any>
        | undefined;
      Object.assign(params, matchedRoute.params);
      if (comp && comp.getInitialProps) {
        pendingDataFetchs.push(async () => {
          const props = await comp.getInitialProps!({
            isServer: true,
            pathname,
            query,
            appContext,
            params: matchedRoute.params,
            redirect: redirector.handler
          });
          routeProps[matchedRoute.route.id] = props || {};
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
        <Router static router={createRouter(history)}>
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

  renderError: IReactServerView['renderError'] = async ({
    url,
    error,
    appContext,
    manifest,
    ErrorComponent,
    getAssetPublicUrl
  }) => {
    const routerContext = {};
    const history = createServerHistory({
      basename: '',
      location: url,
      context: routerContext
    });

    let head: IHtmlTag[];
    let errorProps = { error };

    if (ErrorComponent && ErrorComponent.getInitialProps) {
      errorProps = await ErrorComponent.getInitialProps!({
        isServer: true,
        pathname: url,
        appContext,
        error
      });
    }

    const loadableModules: string[] = [];
    let htmlContent: string;
    try {
      htmlContent = renderToString(
        <Router static router={createRouter(history)}>
          <LoadableContext.Provider
            value={moduleName => loadableModules.push(moduleName)}
          >
            <ErrorComponent {...errorProps} error={error} />
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
      routeProps: [],
      dynamicIds: [...dynamicImportIdSet]
    };

    if (errorProps) {
      appData.appProps = errorProps;
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
