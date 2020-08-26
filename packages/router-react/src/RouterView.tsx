import React from 'react';
import { IParams } from '@shuvi/router';
import { joinPaths } from '@shuvi/router/lib/utils';
import { useCurrentRoute } from './hooks';
import { __DEV__ } from './constants';
import { RouteContext } from './contexts';
import { warningOnce, readOnly } from './utils';

const defaultElement = <RouterView />;

export function RouterView(): React.ReactElement | null {
  const { matches } = useCurrentRoute();

  if (!matches) {
    return null;
  }

  let {
    depth,
    pathname: parentPathname,
    params: parentParams
  } = React.useContext(RouteContext);

  // Otherwise render an element.
  const matched = matches[depth];
  if (!matched) {
    if (__DEV__) {
      warningOnce(
        parentPathname,
        false,
        `Use <RouterView/> under path "${parentPathname}", but it has no children routes.` +
          `\n\n` +
          `Please remove the <RouterView/>.`
      );
    }
    return null;
  }

  const { route, params, pathname } = matched;
  return (
    <RouteContext.Provider
      children={route.element || defaultElement}
      value={{
        depth: depth + 1,
        params: readOnly<IParams>({ ...parentParams, ...params }),
        pathname: joinPaths([parentPathname, pathname]),
        route
      }}
    />
  );
}

if (__DEV__) {
  RouterView.displayName = 'RouterView';
}
