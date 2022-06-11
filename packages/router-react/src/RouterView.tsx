import * as React from 'react';
import { IParams, IRouteMatch } from '@shuvi/router';
import { joinPaths } from '@shuvi/router/lib/utils';
import { useCurrentRoute } from './hooks';
import { __DEV__ } from './constants';
import { MatchedRouteContext } from './contexts';
import { warningOnce, readOnly } from './utils';

const defaultElement = <RouterView />;

function MatchedRoute({
  match,
  depth,
  parentPathname,
  parentParams
}: {
  match: IRouteMatch;
  depth: number;
  parentPathname: string;
  parentParams: IParams;
}) {
  const { route, params, pathname } = match;
  const element = React.useMemo(
    () =>
      route.component
        ? React.createElement(route.component, route.props)
        : defaultElement,
    [route.component, route.props, defaultElement]
  );

  return (
    <MatchedRouteContext.Provider
      children={element}
      value={{
        depth: depth + 1,
        params: readOnly<IParams>({ ...parentParams, ...params }),
        pathname: joinPaths([parentPathname, pathname]),
        route
      }}
    />
  );
}

export function RouterView(): React.ReactElement | null {
  let {
    depth,
    pathname: parentPathname,
    params: parentParams
  } = React.useContext(MatchedRouteContext);
  const { matches } = useCurrentRoute();

  if (!matches) {
    return null;
  }

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

  return (
    <MatchedRoute
      match={matched}
      depth={depth}
      parentPathname={parentPathname}
      parentParams={parentParams}
    />
  );
}

if (__DEV__) {
  RouterView.displayName = 'RouterView';
}
