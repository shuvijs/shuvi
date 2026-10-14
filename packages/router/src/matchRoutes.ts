import {
  IRouteRecord,
  IRouteMatch,
  IRouteBranch,
  IParams,
  PartialLocation
} from './types';
import { matchPathname } from './matchPathname';
import {
  joinPaths,
  normalizeBase,
  resolvePath,
  stripBase,
  isDev,
  warning
} from './utils';
import {
  compilePath,
  getBranchScore,
  comparePathParserScore
} from './pathParserRanker';

export interface IRouteBaseObject<Element = any>
  extends Omit<IRouteRecord<Element>, 'children' | 'element' | 'filepath'> {
  children?: IRouteBaseObject<Element>[];
}

function matchRouteBranch<T extends IRouteBaseObject>(
  branch: IRouteBranch<T>,
  pathname: string,
  strict = false
): IRouteMatch<T>[] | null {
  let routes = branch[1];
  let matchedPathname = '/';
  let matchedParams: IParams = {};

  let matches: IRouteMatch<T>[] = [];
  for (let i = 0; i < routes.length; ++i) {
    let route = routes[i];
    let remainingPathname =
      matchedPathname === '/'
        ? pathname
        : pathname.slice(matchedPathname.length) || '/';
    let routeMatch = matchPathname(
      {
        path: route.path,
        caseSensitive: route.caseSensitive,
        end: i === routes.length - 1,
        strict
      },
      remainingPathname
    );

    if (!routeMatch) return null;

    matchedPathname = joinPaths([matchedPathname, routeMatch.pathname]);
    matchedParams = { ...matchedParams, ...routeMatch.params };

    matches.push({
      route,
      pathname: matchedPathname,
      params: Object.freeze<IParams>(matchedParams)
    });
  }

  return matches;
}

export function rankRouteBranches<T extends [string, ...any[]]>(
  branches: T[]
): T[] {
  if (branches.length <= 1) {
    return branches;
  }

  const normalizedPaths = branches.map((branch, index) => {
    const [path, routes] = branch;
    return {
      ...compilePath(path),
      score: getBranchScore(path, routes),
      index
    };
  });
  normalizedPaths.sort((a, b) => comparePathParserScore(a, b));

  const newBranches: T[] = [];

  normalizedPaths.forEach((branch, newBranchesIndex) => {
    const { index } = branch;
    newBranches[newBranchesIndex] = branches[index];
  });

  return newBranches;
}

function flattenRoutes<T extends IRouteBaseObject>(
  routes: T[],
  branches: IRouteBranch<T>[] = [],
  parentPath = '',
  parentRoutes: T[] = [],
  parentIndexes: number[] = []
): IRouteBranch<T>[] {
  routes.forEach((route, index) => {
    let path;
    if (route.path === '') {
      /**
       * An empty path is allowed, don't append a slash.
       */
      path = parentPath;
    } else {
      path = joinPaths([parentPath, route.path]);
    }
    let routes = parentRoutes.concat(route);
    let indexes = parentIndexes.concat(index);

    // Add the children before adding this route to the array so we traverse the
    // route tree depth-first and child routes appear before their parents in
    // the "flattened" version.
    if (route.children) {
      flattenRoutes(route.children, branches, path, routes, indexes);
    }

    branches.push([path, routes, indexes]);
  });

  return branches;
}

export interface IMatchRoutesOptions {
  strict?: boolean;
}

// Everything matching reads from the routes: each array and its items, and the
// path, caseSensitive and children of each route.
function snapshotRoutes(
  routes: IRouteBaseObject[],
  snapshot: unknown[] = []
): unknown[] {
  snapshot.push(routes, routes.length);
  routes.forEach(route => {
    snapshot.push(route, route.path, route.caseSensitive, route.children);
    if (route.children) {
      snapshotRoutes(route.children, snapshot);
    }
  });
  return snapshot;
}

function isSameSnapshot(a: unknown[], b: unknown[]): boolean {
  return a.length === b.length && a.every((value, i) => value === b[i]);
}

export type RoutesMatcher<T extends IRouteBaseObject> = (
  location: string | PartialLocation,
  basename?: string
) => IRouteMatch<T>[] | null;

/**
 * Flattens and ranks the routes once, on the first match, and reuses them for
 * every match after. The routes must not be mutated once matched.
 */
export function createRoutesMatcher<T extends IRouteBaseObject>(
  routes: T[],
  options: IMatchRoutesOptions = {}
): RoutesMatcher<T> {
  const { strict = false } = options;
  let branches: IRouteBranch<T>[] | undefined;
  // development only, to warn about routes changed in place after the first match
  let snapshot: unknown[] | undefined;

  return (location, basename = '') => {
    if (typeof location === 'string') {
      location = resolvePath(location);
    }

    let pathname = location.pathname || '/';
    if (basename) {
      const normalizedBasename = normalizeBase(basename);
      const pathnameWithoutBase = stripBase(pathname, normalizedBasename);
      if (pathnameWithoutBase) {
        pathname = pathnameWithoutBase;
      } else {
        return null;
      }
    }

    if (!branches) {
      branches = rankRouteBranches(flattenRoutes(routes));
      if (isDev) {
        snapshot = snapshotRoutes(routes);
      }
    } else if (snapshot && !isSameSnapshot(snapshot, snapshotRoutes(routes))) {
      warning(
        false,
        `Routes were changed in place after they had been matched. ` +
          `The change is ignored by matching, ` +
          `use router.replaceRoutes() to change the routes instead.`
      );
      snapshot = undefined;
    }

    let matches: IRouteMatch<T>[] | null = null;
    for (let i = 0; matches == null && i < branches.length; ++i) {
      // TODO: Match on search, state too?
      matches = matchRouteBranch<T>(branches[i], pathname, strict);
    }

    return matches;
  };
}

export function matchRoutes<T extends IRouteBaseObject>(
  routes: T[],
  location: string | PartialLocation,
  basename = '',
  options: IMatchRoutesOptions = {}
): IRouteMatch<T>[] | null {
  return createRoutesMatcher(routes, options)(location, basename);
}

/**
 * When strict trailing-slash routing is enabled, a pathname that does not
 * match any route may be a non-canonical variant (e.g. `/foo/` for a route
 * declared as `/foo`). This computes the canonical alternative by stripping
 * a single trailing slash (or adding one when the route is slash-suffixed) and
 * returns it so the caller can issue a redirect. Returns `null` when the
 * pathname is already canonical (`/` or no trailing slash to strip).
 */
export function getTrailingSlashRedirectPath(pathname: string): string | null {
  if (pathname === '/' || pathname === '') {
    return null;
  }
  // strip a single trailing slash
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  // otherwise the non-canonical variant is the slash-suffixed form
  return pathname + '/';
}
