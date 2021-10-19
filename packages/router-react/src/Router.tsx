import React, { useRef, useReducer } from 'react';
import PropTypes from 'prop-types';
import {
  IRoute,
  IPageError,
  ShuviErrorCode,
  IRouteRecord
} from '@shuvi/router';
import invariant from '@shuvi/utils/lib/invariant';
import { RouterContext, RouteContext } from './contexts';
import { useInRouterContext } from './hooks';
import { __DEV__ } from './constants';
import { useIsomorphicEffect } from './utils';
import { IRouterProps } from './types';

/**
 * Provides location context for the rest of the app.
 *
 * Note: You usually won't render a <Router> directly. Instead, you'll render a
 * router that is more specific to your environment such as a <BrowserRouter>
 * in web browsers or a <StaticRouter> for server rendering.
 */

const defaultErrorState = {
  errorCode: undefined,
  errorDesc: undefined
};

function checkError(
  routerCurrent: IRoute<IRouteRecord>,
  error: IPageError,
  ErrorComp?: React.ComponentType<IPageError>
) {
  if (error.errorCode !== undefined) {
    return ErrorComp && <ErrorComp {...error} />;
  }
  if (!routerCurrent.matches) {
    return ErrorComp && <ErrorComp errorCode={ShuviErrorCode.PAGE_NOT_FOUND} />;
  }
  const matched = routerCurrent.matches[0];
  const {
    route: { component }
  } = matched;
  const __error = component?.getInitialProps?.__error;
  if (__error) {
    return ErrorComp && <ErrorComp {...__error} />;
  }
  return null;
}
export function Router({
  children = null,
  static: staticProp = false,
  router,
  error = defaultErrorState,
  ErrorComp
}: IRouterProps): React.ReactElement {
  invariant(
    !useInRouterContext(),
    `You cannot render a <Router> inside another <Router>.` +
      ` You never need more than one.`
  );

  const contextVal = React.useMemo(() => {
    return {
      static: staticProp,
      router: router
    };
  }, [staticProp, router]);

  const unmount = useRef(false);
  const forceupdate = useReducer(s => s * -1, 1)[1];

  const [errorState, removeSSRError] = useReducer(
    (_s: IPageError): IPageError => defaultErrorState,
    error
  );

  useIsomorphicEffect(() => () => (unmount.current = true), []);
  useIsomorphicEffect(
    () =>
      router.listen(() => {
        if (unmount.current) {
          return;
        }
        // remove ssr error state
        if (errorState?.errorCode !== undefined) {
          removeSSRError();
        }
        forceupdate();
      }),
    [router]
  );

  return (
    <RouterContext.Provider value={contextVal}>
      {checkError(router.current, errorState, ErrorComp) || (
        <RouteContext.Provider children={children} value={router.current} />
      )}
    </RouterContext.Provider>
  );
}

if (__DEV__) {
  Router.displayName = 'Router';
  Router.propTypes = {
    children: PropTypes.node,
    router: PropTypes.object,
    static: PropTypes.bool,
    error: PropTypes.object,
    ErrorComp: PropTypes.elementType
  };
}
