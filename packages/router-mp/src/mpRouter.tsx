import * as React from 'react';
import * as qs from 'query-string';
import * as PropTypes from 'prop-types';
import { Current as TaroCurrent } from '@tarojs/runtime';
import { InitialEntry, createRouter, IRouter } from '@shuvi/router';
import { createMpHistory } from './mpHistory';
import { Router, RouterView, IRouteRecord } from '@shuvi/router-react';
import { __DEV__ } from './constants';
import AppContainer from '@shuvi/platform-web/shuvi-app/react/AppContainer';

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

  // FIXME
  // @ts-ignore: get app from somewhere
  const app = null as any;
  if (routerRef.current == null) {
    routerRef.current = createRouter({
      basename,
      routes: routes || [],
      history: createMpHistory({ initialEntries, initialIndex: 0 })
    }).init();

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
        try {
          current.params = {
            ...current.params,
            ...JSON.parse(decodeURIComponent(query.__params as string))
          };
        } catch (e) {
          console.error(e);
        }
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

  return (
    <Router router={routerRef.current}>
      <AppContainer app={app}>
        <RouterView />
      </AppContainer>
    </Router>
  );
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
