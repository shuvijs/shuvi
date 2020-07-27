import React from 'react';
import PropTypes from 'prop-types';
import { Action, createRouter } from '@shuvi/router';
import { LocationContext } from './contexts';
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
  action = Action.Pop,
  location,
  navigator,
  static: staticProp = false
}: IRouterProps): React.ReactElement {
  invariant(
    !useInRouterContext(),
    `You cannot render a <Router> inside another <Router>.` +
      ` You never need more than one.`
  );

  let contextVal = React.useMemo(() => {
    return {
      action,
      location,
      navigator,
      static: staticProp,
      router: createRouter(navigator as any) // navigator is history, typing as any
    };
  }, [action, location, navigator, staticProp]);

  return <LocationContext.Provider children={children} value={contextVal} />;
}

if (__DEV__) {
  Router.displayName = 'Router';
  Router.propTypes = {
    children: PropTypes.node,
    action: PropTypes.oneOf(['POP', 'PUSH', 'REPLACE']),
    location: PropTypes.object.isRequired,
    navigator: PropTypes.shape({
      createHref: PropTypes.func.isRequired,
      push: PropTypes.func.isRequired,
      replace: PropTypes.func.isRequired,
      go: PropTypes.func.isRequired,
      block: PropTypes.func.isRequired
    }).isRequired,
    static: PropTypes.bool
  };
}
