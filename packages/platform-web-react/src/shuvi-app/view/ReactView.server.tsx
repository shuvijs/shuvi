import React from 'react';
import { renderToString } from 'react-dom/server';
import { Runtime } from '@shuvi/service';
import { Router } from '@shuvi/router-react';
import { createRedirector, IParams } from '@shuvi/router';
import { ROUTE_NOT_FOUND_NAME } from '@shuvi/shared/lib/constants';
import Loadable, { LoadableContext } from '../loadable';
import AppContainer from '../AppContainer';
import { IReactServerView, IReactAppData } from '../types';
import { Head } from '../head';

import IAppComponent = Runtime.IAppComponent;
import IRouteComponent = Runtime.IRouteComponent;
import IHtmlTag = Runtime.IHtmlTag;

export class ReactServerView implements IReactServerView {
  renderApp: IReactServerView['renderApp'] = async ({
    AppComponent,
    router,
    appContext,
    manifest,
    getAssetPublicUrl,
    render
  }) => {
    await Loadable.preloadAll();

    const redirector = createRedirector();

    await router.ready;

    let { pathname, query, matches, redirected } = router.current;
    // TODO: handler no matches
    if (!matches) {
      matches = [];
    }

    if (redirected) {
      return {
        redirect: {
          path: pathname
        }
      };
    }

    const routeProps: { [x: string]: any } = {};
    const pendingDataFetchs: Array<() => Promise<void>> = [];
    const params: IParams = {};
    for (let index = 0; index < matches.length; index++) {
      const matchedRoute = matches[index];
      const appRoute = matchedRoute.route as Runtime.IAppRouteConfig;
      if (appRoute.name === ROUTE_NOT_FOUND_NAME) {
        // set response code
        appContext.statusCode = 404;
      }
      const comp = appRoute.component as
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
          routeProps[appRoute.id] = props || {};
          matchedRoute.route.props = props;
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
      const renderAppToString = () =>
        renderToString(
          <Router static router={router}>
            <LoadableContext.Provider
              value={moduleName => loadableModules.push(moduleName)}
            >
              <AppContainer appContext={appContext}>
                <AppComponent {...appInitialProps} />
              </AppContainer>
            </LoadableContext.Provider>
          </Router>
        );

      if (render) {
        htmlContent = render(renderAppToString, appContext as any);
      } else {
        htmlContent = renderAppToString();
      }
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
