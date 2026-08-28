import {
  IRouteRecord,
  IRouteMatch,
  IRouteBranch,
  IParams,
  PartialLocation
} from './types';
import { matchPathname } from './matchPathname';
import { joinPaths, normalizeBase, resolvePath, stripBase } from './utils';
import { tokensToParser, comparePathParserScore } from './pathParserRanker';
import { tokenizePath } from './pathTokenizer';

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
      ...tokensToParser(tokenizePath(path), undefined, { routes }),
      path,
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

export function matchRoutes<T extends IRouteBaseObject>(
  routes: T[],
  location: string | PartialLocation,
  basename = '',
  options: IMatchRoutesOptions = {}
): IRouteMatch<T>[] | null {
  const { strict = false } = options;
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

  let branches = flattenRoutes(routes);
  branches = rankRouteBranches(branches);

  let matches: IRouteMatch<T>[] | null = null;
  for (let i = 0; matches == null && i < branches.length; ++i) {
    // TODO: Match on search, state too?
    matches = matchRouteBranch<T>(branches[i], pathname, strict);
  }

  return matches;
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
