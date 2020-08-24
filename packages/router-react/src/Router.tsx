import React from 'react';
import PropTypes from 'prop-types';
import { RouterContext } from './contexts';
import { useInRouterContext } from './hooks';
import { __DEV__ } from './constants';
import { invariant } from './utils';
import { IRouterProps } from './types';

/**
 * Provides location context for the rest of the app.
 *
 * Note: You usually won't render a <Router> directly. Instead, you'll render a
 * router that is more specific to your environment such as a <BrowserRouter>
 * in web browsers or a <StaticRouter> for server rendering.
 */
export function Router({
  children = null,
  static: staticProp = false,
  router
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

  return <RouterContext.Provider children={children} value={contextVal} />;
}

if (__DEV__) {
  Router.displayName = 'Router';
  Router.propTypes = {
    children: PropTypes.node,
    router: PropTypes.object,
    static: PropTypes.bool
  };
}
