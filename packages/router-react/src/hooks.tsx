import React from 'react';
import { joinPaths } from '@shuvi/router/src/utils';
import {
  createRoutesFromArray,
  matchPath,
  matchRoutes,
  resolvePath,
  INavigator,
  IPathPattern,
  IParams,
  IPathMatch,
  Blocker,
  Location,
  Path,
  State,
  To,
  Transition,
  IRouter
} from '@shuvi/router';
import { Outlet } from './Outlet';
import { __DEV__ } from './constants';
import { LocationContext, RouteContext } from './contexts';
import { invariant, warning, warningOnce, readOnly } from './utils';
import { INavigateFunction, IPartialRouteObject, IRouteObject } from './types';

/**
 * Blocks all navigation attempts. This is useful for preventing the page from
 * changing until some condition is met, like saving form data.
 */
export function useBlocker(blocker: Blocker, when = true): void {
  invariant(
    useInRouterContext(),
    `useBlocker() may be used only in the context of a <Router> component.`
  );

  let navigator = React.useContext(LocationContext).navigator as INavigator;

  React.useEffect(() => {
    if (!when) return;

    let unblock = navigator.block((tx: Transition) => {
      let autoUnblockingTx = {
        ...tx,
        retry() {
          // Automatically unblock the transition so it can play all the way
          // through before retrying it. TODO: Figure out how to re-enable
          // this block if the transition is cancelled for some reason.
          unblock();
          tx.retry();
        }
      };

      blocker(autoUnblockingTx);
    });

    return unblock;
  }, [navigator, blocker, when]);
}

/**
 * Returns the full href for the given "to" value. This is useful for building
 * custom links that are also accessible and preserve right-click behavior.
 */
export function useHref(to: To): string {
  invariant(
    useInRouterContext(),
    `useHref() may be used only in the context of a <Router> component.`
  );

  let navigator = React.useContext(LocationContext).navigator as INavigator;
  let path = useResolvedPath(to);

  return navigator.createHref(path);
}

/**
 * Returns true if this component is a descendant of a <Router>.
 */
export function useInRouterContext(): boolean {
  return React.useContext(LocationContext).location != null;
}

/**
 * Returns the current location object, which represents the current URL in web
 * browsers.
 *
 * Note: If you're using this it may mean you're doing some of your own
 * "routing" in your app, and we'd like to know what your use case is. We may
 * be able to provide something higher-level to better suit your needs.
 */
export function useLocation(): Location {
  invariant(
    useInRouterContext(),
    `useLocation() may be used only in the context of a <Router> component.`
  );

  return React.useContext(LocationContext).location as Location;
}

/**
 * Returns true if the URL for the given "to" value matches the current URL.
 * This is useful for components that need to know "active" state, e.g.
 * <NavLink>.
 */
export function useMatch(pattern: IPathPattern): IPathMatch | null {
  invariant(
    useInRouterContext(),
    `useMatch() may be used only in the context of a <Router> component.`
  );

  let location = useLocation() as Location;
  return matchPath(pattern, location.pathname);
}

/**
 * Returns an imperative method for changing the location. Used by <Link>s, but
 * may also be used by other elements to change the location.
 */
export function useNavigate(): INavigateFunction {
  invariant(
    useInRouterContext(),
    `useNavigate() may be used only in the context of a <Router> component.`
  );

  let locationContext = React.useContext(LocationContext);
  let navigator = locationContext.navigator as INavigator;
  let { pathname } = React.useContext(RouteContext);

  let activeRef = React.useRef(false);
  React.useEffect(() => {
    activeRef.current = true;
  });

  let navigate: INavigateFunction = React.useCallback(
    (to: To | number, options: { replace?: boolean; state?: State } = {}) => {
      if (activeRef.current) {
        if (typeof to === 'number') {
          navigator.go(to);
        } else {
          let path = resolvePath(to, pathname);
          (!!options.replace ? navigator.replace : navigator.push)(
            path,
            options.state
          );
        }
      } else {
        warning(
          false,
          `You should call navigate() in a useEffect, not when ` +
            `your component is first rendered.`
        );
      }
    },
    [navigator, pathname]
  );

  return navigate;
}

/**
 * Returns the element for the child route at this level of the route
 * hierarchy. Used internally by <Outlet> to render child routes.
 */
export function useOutlet(): React.ReactElement | null {
  return React.useContext(RouteContext).outlet;
}

/**
 * Returns an object of key/value pairs of the dynamic params from the current
 * URL that were matched by the route path.
 */
export function useParams(): IParams {
  return React.useContext(RouteContext).params;
}

/**
 * Resolves the pathname of the given `to` value against the current location.
 */
export function useResolvedPath(to: To): Path {
  let { pathname } = React.useContext(RouteContext);
  return React.useMemo(() => resolvePath(to, pathname), [to, pathname]);
}

/**
 * Returns the element of the route that matched the current location, prepared
 * with the correct context to render the remainder of the route tree. Route
 * elements in the tree must render an <Outlet> to render their child route's
 * element.
 */
export function useRoutes(
  partialRoutes: IPartialRouteObject[],
  basename = ''
): React.ReactElement | null {
  invariant(
    useInRouterContext(),
    `useRoutes() may be used only in the context of a <Router> component.`
  );

  let routes = React.useMemo(
    () => createRoutesFromArray(partialRoutes, <Outlet />),
    [partialRoutes]
  );

  return useRoutes_(routes, basename);
}

export function useRoutes_(
  routes: IRouteObject[],
  basename = ''
): React.ReactElement | null {
  let {
    route: parentRoute,
    pathname: parentPathname,
    params: parentParams
  } = React.useContext(RouteContext);

  if (__DEV__) {
    // You won't get a warning about 2 different <Routes> under a <Route>
    // without a trailing *, but this is a best-effort warning anyway since we
    // cannot even give the warning unless they land at the parent route.
    let parentPath = parentRoute && parentRoute.path;
    warningOnce(
      parentPathname,
      !parentRoute || parentRoute.path.endsWith('*'),
      `You rendered descendant <Routes> (or called \`useRoutes\`) at "${parentPathname}"` +
        ` (under <Route path="${parentPath}">) but the parent route path has no trailing "*".` +
        ` This means if you navigate deeper, the parent won't match anymore and therefore` +
        ` the child routes will never render.` +
        `\n\n` +
        `Please change the parent <Route path="${parentPath}"> to <Route path="${parentPath}/*">.`
    );
  }

  basename = basename ? joinPaths([parentPathname, basename]) : parentPathname;

  let location = useLocation() as Location;
  let matches = React.useMemo(() => matchRoutes(routes, location, basename), [
    location,
    routes,
    basename
  ]);

  if (!matches) {
    return null;
  }

  // Otherwise render an element.
  let element = matches.reduceRight((outlet, { params, pathname, route }) => {
    return (
      <RouteContext.Provider
        children={route.element}
        value={{
          outlet,
          params: readOnly<IParams>({ ...parentParams, ...params }),
          pathname: joinPaths([basename, pathname]),
          route
        }}
      />
    );
  }, null as React.ReactElement | null);

  return element;
}

/**
 * Returns the current router object
 */
export function useRouter(): IRouter {
  invariant(
    useInRouterContext(),
    `useLocation() may be used only in the context of a <Router> component.`
  );

  return React.useContext(LocationContext).router as IRouter;
}
