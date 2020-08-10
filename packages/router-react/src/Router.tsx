//
import React from 'react';
import PropTypes from 'prop-types';
import { Action, Update, createRouter } from '@shuvi/router';
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
  history,
  static: staticProp = false,
  router = createRouter(history)
}: IRouterProps): React.ReactElement {
  invariant(
    !useInRouterContext(),
    `You cannot render a <Router> inside another <Router>.` +
      ` You never need more than one.`
  );

  let [{ action, location }, dispatch] = React.useReducer(
    (_: Update, action: Update) => action,
    {
      action: history.action || Action.Pop,
      location: history.location
    }
  );

  // @ts-ignore
  if (typeof window !== 'undefined') {
    React.useLayoutEffect(() => history.listen(dispatch), [history]);
  }

  let contextVal = React.useMemo(() => {
    return {
      action,
      location,
      navigator: history,
      static: staticProp,
      router // navigator is history, typing as any
    };
  }, [history, action, location, staticProp, router]);

  return <LocationContext.Provider children={children} value={contextVal} />;
}

if (__DEV__) {
  Router.displayName = 'Router';
  Router.propTypes = {
    children: PropTypes.node,
    history: PropTypes.object,
    static: PropTypes.bool
  };
}
