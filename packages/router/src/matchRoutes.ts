import {
  IRouteRecord,
  IRouteMatch,
  IRouteBranch,
  IParams,
  PartialLocation
} from './types';
import { matchPathname } from './matchPathname';
import { joinPaths, resolvePath } from './utils';
import { tokensToParser } from '@shuvi/router/lib/pathParserRanker';
import { tokenizePath } from '@shuvi/router/lib/pathTokenizer';

export interface IRouteBaseObject<Element = any>
  extends Omit<IRouteRecord<Element>, 'children' | 'element'> {
  children?: IRouteBaseObject<Element>[];
}

function computeScore(
  path: string
): number {
  const source = path ? path.replace(/^\/*/, '/') : path; // Make sure it has a leading /
  const { score = [] } = tokensToParser(tokenizePath(source));
  let initScore = 0;
  while (score.length) {
    const last = score.pop();
    for (let i = 0; last && i < last.length; i++) {
      initScore += last[i];
    }
  }
  return initScore;
}

function compareIndexes(a: number[], b: number[]): number {
  let siblings =
    a.length === b.length && a.slice(0, -1).every((n, i) => n === b[i]);

  return siblings
    ? // If two routes are siblings, we should try to match the earlier sibling
      // first. This allows people to have fine-grained control over the matching
      // behavior by simply putting routes with identical paths in the order they
      // want them tried.
    a[a.length - 1] - b[b.length - 1]
    : // Otherwise, it doesn't really make sense to rank non-siblings by index,
      // so they sort equally.
    0;
}

function stableSort(array: any[], compareItems: (a: any, b: any) => number) {
  // This copy lets us get the original index of an item so we can preserve the
  // original ordering in the case that they sort equally.
  let copy = array.slice(0);
  array.sort((a, b) => compareItems(a, b) || copy.indexOf(a) - copy.indexOf(b));
}

function matchRouteBranch<T extends IRouteBaseObject>(
  branch: IRouteBranch<T>,
  pathname: string
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
        end: i === routes.length - 1
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

function rankRouteBranches(branches: IRouteBranch[]): void {
  let pathScores = branches.reduce<Record<string, number>>((memo, [path]) => {
    memo[path] = computeScore(path);
    return memo;
  }, {});

  console.log(pathScores);

  // Sorting is stable in modern browsers, but we still support IE 11, so we
  // need this little helper.
  stableSort(branches, (a, b) => {
    let [aPath, , aIndexes] = a;
    let aScore = pathScores[aPath];

    let [bPath, , bIndexes] = b;
    let bScore = pathScores[bPath];

    return aScore !== bScore
      ? bScore - aScore // Higher score first
      : compareIndexes(aIndexes, bIndexes);
  });
}

export function flattenRoutes<T extends IRouteBaseObject>(
  routes: T[],
  branches: IRouteBranch<T>[] = [],
  parentPath = '',
  parentRoutes: T[] = [],
  parentIndexes: number[] = []
): IRouteBranch<T>[] {
  routes.forEach((route, index) => {
    let path = joinPaths([parentPath, route.path]);
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

export function matchRoutes<T extends IRouteBaseObject>(
  routes: T[],
  location: string | PartialLocation,
  basename = ''
): IRouteMatch<T>[] | null {
  if (typeof location === 'string') {
    location = resolvePath(location);
  }

  let pathname = location.pathname || '/';
  if (basename) {
    let base = basename.replace(/^\/*/, '/').replace(/\/+$/, '');
    if (pathname.startsWith(base)) {
      pathname = pathname === base ? '/' : pathname.slice(base.length);
    } else {
      // Pathname does not start with the basename, no match.
      return null;
    }
  }

  let branches = flattenRoutes(routes);
  rankRouteBranches(branches);

  let matches: IRouteMatch<T>[] | null = null;
  for (let i = 0; matches == null && i < branches.length; ++i) {
    // TODO: Match on search, state too?
    matches = matchRouteBranch<T>(branches[i], pathname);
  }

  return matches;
}
