//
import React from 'react';
import PropTypes from 'prop-types';
import { Action, Update, IRouter } from '@shuvi/router';
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
  static: staticProp = false,
  router
}: IRouterProps): React.ReactElement {
  invariant(
    !useInRouterContext(),
    `You cannot render a <Router> inside another <Router>.` +
      ` You never need more than one.`
  );

  let [updatedRouter, dispatch] = React.useReducer(
    (previousRouter: IRouter, action: Update) => ({
      ...previousRouter,
      ...action
    }),
    {
      ...router,
      action: router.action || Action.Pop,
      location: router.location
    }
  );

  // @ts-ignore ignoring because of window
  if (typeof window !== 'undefined') {
    React.useLayoutEffect(() => router.onChange(dispatch), [router]);
  }

  let contextVal = React.useMemo(() => {
    return {
      static: staticProp,
      router: updatedRouter
    };
  }, [staticProp, updatedRouter]);

  return <LocationContext.Provider children={children} value={contextVal} />;
}

if (__DEV__) {
  Router.displayName = 'Router';
  Router.propTypes = {
    children: PropTypes.node,
    router: PropTypes.object,
    static: PropTypes.bool
  };
}
