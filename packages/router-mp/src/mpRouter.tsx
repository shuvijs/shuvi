import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as qs from 'query-string';
import * as PropTypes from 'prop-types';
import { Current as TaroCurrent } from '@tarojs/runtime';
import { InitialEntry, createRouter, IRouter } from '@shuvi/router';
import { createMpHistory } from './mpHistory';
import { Router, RouterView, IRouteRecord } from '@shuvi/router-react';
import { __DEV__ } from './constants';
import ErrorPage from './ErrorPage';
import {
  getModelManager,
  getErrorModel
} from '@shuvi/platform-shared/esm/runtime';
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

  const [initProps, setProps] = useState<boolean>(false);

  const modelManager = getModelManager();

  const error = getErrorModel(modelManager);

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

  const appContext = {
    pageData: {},
    routeProps: {},
    historyMode: 'memory'
  };

  const isRendered = useRef(true);
  useEffect(() => {
    const router = routerRef.current;
    isRendered.current = true;
    const runGetInitialProps = async () => {
      await router!.ready;
      error.reset();
      if (isRendered.current) setProps(true);
    };
    runGetInitialProps();
    return () => {
      isRendered.current = false;
    };
  }, []);

  return initProps ? (
    <Router router={routerRef.current}>
      <AppContainer
        appContext={appContext}
        modelManager={modelManager}
        errorComp={ErrorPage}
      >
        <RouterView />
      </AppContainer>
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
