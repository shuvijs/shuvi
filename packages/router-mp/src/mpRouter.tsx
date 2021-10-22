import React, { useEffect, useState } from 'react';
import qs from 'query-string';
import PropTypes from 'prop-types';
import { Current as TaroCurrent } from '@tarojs/runtime';
import {
  InitialEntry,
  createRouter,
  IRouter,
  createRedirector
} from '@shuvi/router';
import { createMpHistory } from './mpHistory';
import { Router, RouterView, IRouteRecord } from '@shuvi/router-react';
import { __DEV__ } from './constants';
import ErrorPage from './ErrorPage';
import { getAppStore, getErrorHandler } from '@shuvi/platform-core';
import { AppStore } from '@shuvi/platform-web-react/shuvi-app/AppStore';

export interface IMpRouterProps {
  basename?: string;
  children?: React.ReactNode;
  routes?: IRouteRecord[];
  initialEntries?: InitialEntry[];
}

/**
 * A <Router> that just stores one entries in memory.
 */
export function MpRouter({
  basename = '/',
  routes,
  initialEntries
}: IMpRouterProps): React.ReactElement | null {
  let routerRef = React.useRef<IRouter>();

  const [initProps, setProps] = useState<boolean>(false);

  const redirector = createRedirector();

  const appStore = getAppStore();

  const error = getErrorHandler();

  if (routerRef.current == null) {
    routerRef.current = createRouter({
      basename,
      routes: routes || [],
      history: createMpHistory({ initialEntries, initialIndex: 0 })
    });

    // mp params storage at query property __params
    // @ts-ignore
    const current = routerRef.current._current;
    // @ts-ignore
    if (current && TaroCurrent.page.$taroParams) {
      // @ts-ignore
      const query = TaroCurrent.page.$taroParams;
      // remove taro $taroTimestamp
      if (query.$taroTimestamp) {
        delete query.$taroTimestamp;
      }
      if (query.__params) {
        // move __params to params, rewrite search property
        current.params = {
          ...current.params,
          ...JSON.parse(query.__params as string)
        };
        delete query.__params;
        if (query.__pathname) {
          current.pathname = query.__pathname as string;
          delete query.__pathname;
        }
        current.search = Object.keys(query).length
          ? `?${qs.stringify(query)}`
          : '';
      }
      current.query = query;
    }
  }

  const appContext = {
    pageData: {},
    routeProps: {},
    historyMode: 'memory'
  };

  useEffect(() => {
    const router = routerRef.current;
    const runGetInitialProps = async () => {
      const { pathname, query, params, matches } = router!.current;
      await router!.ready;
      const matchRoute = matches && matches[0] && matches[0].route;
      let props = {};
      error.reset();
      if (matchRoute && matchRoute.component.getInitialProps) {
        props = await matchRoute.component.getInitialProps({
          isServer: false,
          pathname,
          query,
          params,
          redirect: redirector.handler,
          appContext,
          error: error.errorHandler,
          async fetchInitialProps() {
            // do nothing
          }
        });
        matchRoute.props = {
          ...props,
          ...(matchRoute.props || {})
        };
        if (redirector.redirected) {
          router!.replace(redirector.state!.path);
          return;
        }
      }
      setProps(true);
    };
    runGetInitialProps();
  }, []);

  return initProps ? (
    <Router router={routerRef.current}>
      <AppStore store={appStore} ErrorComp={ErrorPage}>
        <RouterView />
      </AppStore>
    </Router>
  ) : null;
}

if (__DEV__) {
  MpRouter.displayName = 'MpRouter';
  MpRouter.propTypes = {
    children: PropTypes.node,
    routes: PropTypes.arrayOf(PropTypes.object),
    initialEntries: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          pathname: PropTypes.string,
          search: PropTypes.string,
          hash: PropTypes.string,
          state: PropTypes.object,
          key: PropTypes.string
        })
      ])
    ),
    initialIndex: PropTypes.number
  };
}
