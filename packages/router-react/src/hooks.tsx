import React, { useReducer, useRef, useEffect, useLayoutEffect } from 'react';
import {
  IParams,
  IPathMatch,
  Blocker,
  Path,
  State,
  PathRecord,
  Transition,
  IRouter,
  IPathPattern,
  matchPath
} from '@shuvi/router';
import { __DEV__ } from './constants';
import { RouterContext, RouteContext } from './contexts';
import { invariant, warning } from './utils';
import { INavigateFunction } from './types';

function useIsomorphicEffect(cb: any, deps: any): void {
  if (typeof window !== 'undefined') {
    useLayoutEffect(cb, deps);
  } else {
    useEffect(cb, deps);
  }
}

export function useCurrentRoute() {
  const unmount = useRef(false);
  const forceupdate = useReducer(s => s * -1, 1)[1];
  const router = useRouter();

  useIsomorphicEffect(() => () => (unmount.current = true), []);
  useIsomorphicEffect(
    () =>
      router.listen(() => {
        if (unmount.current) {
          return;
        }
        forceupdate();
      }),
    [router]
  );

  return router.current;
}

/**
 * Blocks all navigation attempts. This is useful for preventing the page from
 * changing until some condition is met, like saving form data.
 */
export function useBlocker(blocker: Blocker, when = true): void {
  invariant(
    useInRouterContext(),
    `useBlocker() may be used only in the context of a <Router> component.`
  );

  const { router } = React.useContext(RouterContext);

  React.useEffect(() => {
    if (!when) return;

    let unblock = router.block((tx: Transition) => {
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
  }, [router, blocker, when]);
}

/**
 * Returns the full href for the given "to" value. This is useful for building
 * custom links that are also accessible and preserve right-click behavior.
 */
export function useHref(to: PathRecord): string {
  invariant(
    useInRouterContext(),
    `useHref() may be used only in the context of a <Router> component.`
  );

  const { router } = React.useContext(RouterContext);
  const path = useResolvedPath(to);
  return router.resolve(path).href;
}

/**
 * Returns true if this component is a descendant of a <Router>.
 */
export function useInRouterContext(): boolean {
  return React.useContext(RouterContext) != null;
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

  const { pathname } = useCurrentRoute();
  return matchPath(pattern, pathname);
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

  const { router } = React.useContext(RouterContext);
  const { pathname } = React.useContext(RouteContext);

  const activeRef = React.useRef(false);
  React.useEffect(() => {
    activeRef.current = true;
  });

  let navigate: INavigateFunction = React.useCallback(
    (
      to: PathRecord | number,
      options: { replace?: boolean; state?: State } = {}
    ) => {
      if (activeRef.current) {
        if (typeof to === 'number') {
          router.go(to);
        } else {
          let { path } = router.resolve(to, pathname);
          (!!options.replace ? router.replace : router.push).call(
            router,
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
    [router, pathname]
  );

  return navigate;
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
export function useResolvedPath(to: PathRecord): Path {
  const { router } = React.useContext(RouterContext);
  const { pathname } = React.useContext(RouteContext);
  return React.useMemo(() => router.resolve(to, pathname).path, [to, pathname]);
}

/**
 * Returns the current router object
 */
export function useRouter(): IRouter {
  invariant(
    useInRouterContext(),
    `useRouter() may be used only in the context of a <Router> component.`
  );

  return React.useContext(RouterContext).router;
}
