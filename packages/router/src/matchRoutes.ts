import {
  IRouteRecord,
  IRouteMatch,
  IRouteBranch,
  IParams,
  PartialLocation
} from './types';
import { matchPathname } from './matchPathname';
import { joinPaths, resolvePath } from './utils';
import { tokensToParser, comparePathParserScore } from './pathParserRanker';
import { tokenizePath } from './pathTokenizer';

export interface IRouteBaseObject<Element = any>
  extends Omit<IRouteRecord<Element>, 'children' | 'element'> {
  children?: IRouteBaseObject<Element>[];
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

function rankRouteBranches<T extends [string, ...any[]]>(branches: T[]): T[] {

  const normalizedPaths = branches.map((branch, index) =>{
    const [ path ] = branch;
    return {
      ...tokensToParser(tokenizePath(path)),
      path,
      index
    }
  })
  normalizedPaths.sort((
    a,
    b
  ) => comparePathParserScore(a, b))

  const newBranches: T[] = [];

  // console.log(
  //   normalizedPaths
  //     .map(parser => `${parser.path} -> ${JSON.stringify(parser.score)}`)
  //     .join('\n')
  // )

  normalizedPaths.forEach(((branch, newBranchesIndex) => {
    const { index } = branch;
    newBranches[newBranchesIndex] = branches[index];
  }))

  return newBranches;

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
  branches = rankRouteBranches(branches);

  let matches: IRouteMatch<T>[] | null = null;
  for (let i = 0; matches == null && i < branches.length; ++i) {
    // TODO: Match on search, state too?
    matches = matchRouteBranch<T>(branches[i], pathname);
  }

  return matches;
}
