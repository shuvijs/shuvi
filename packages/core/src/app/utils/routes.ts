import { Runtime } from '@shuvi/types';
import {
  pathToRegexp,
  Key,
  TokensToRegexpOptions,
  ParseOptions
} from 'path-to-regexp';
import IMatchedRoute = Runtime.IMatchedRoute;
import IRouteBase = Runtime.IRouteBase;

type ICompilePathOptions = TokensToRegexpOptions & ParseOptions;
type IMatchPathOptions =
  | (ICompilePathOptions & {
      path?: string | Array<string>;
      exact?: boolean;
    })
  | string
  | Array<string>;

interface IMatch<Params extends { [K in keyof Params]?: string } = {}> {
  params: Params;
  isExact: boolean;
  path: string;
  url: string;
}

// https://github.com/ReactTraining/react-router/blob/29e02a301a6d2f73f6c009d973f87e004c83bea4/packages/react-router/modules/matchPath.js
const cache: {
  [key: string]: {
    [path: string]:
      | {
          regexp: RegExp;
          keys: Key[];
        }
      | undefined;
  };
} = {};
const cacheLimit = 10000;
let cacheCount = 0;

function compilePath(path: string, options: ICompilePathOptions) {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
  const pathCache = cache[cacheKey] || (cache[cacheKey] = {});

  if (pathCache[path]) return pathCache[path]!;

  const keys: Key[] = [];
  const regexp = pathToRegexp(path, keys, options);
  const result = { regexp, keys };

  if (cacheCount < cacheLimit) {
    pathCache[path] = result;
    cacheCount++;
  }

  return result;
}

/**
 * Public API for matching a URL pathname to a path.
 */
function matchPath<Params extends { [K in keyof Params]?: string }>(
  pathname: string,
  options: IMatchPathOptions = {}
) {
  if (typeof options === 'string' || Array.isArray(options)) {
    options = { path: options };
  }

  const { path, exact = false, strict = false, sensitive = false } = options;

  const paths = ([] as Array<string>).concat(path!);

  return paths.reduce((matched, path) => {
    if (!path && path !== '') return null;
    if (matched) return matched;

    const { regexp, keys } = compilePath(path, {
      end: exact,
      strict,
      sensitive
    });
    const match = regexp.exec(pathname);

    if (!match) return null;

    const [url, ...values] = match;
    const isExact = pathname === url;

    if (exact && !isExact) return null;

    return {
      path, // the path used to match
      url: path === '/' && url === '' ? '/' : url, // the matched portion of the URL
      isExact, // whether or not we matched exactly
      params: keys.reduce((memo: any, key, index) => {
        memo[key.name] = values[index];
        return memo;
      }, {} as Params)
    };
  }, null as null | IMatch<Params>);
}

const computeRootMatch = (pathname: string) => {
  return { path: '/', url: '/', params: {}, isExact: pathname === '/' };
};

// https://github.com/ReactTraining/react-router/blob/ea44618e68f6a112e48404b2ea0da3e207daf4f0/packages/react-router-config/modules/matchRoutes.js
export function matchRoutes(
  routes: IRouteBase[],
  pathname: string,
  /*not public API*/ branch: IMatchedRoute[] = []
): IMatchedRoute[] {
  routes.some(route => {
    const match = route.path
      ? matchPath(pathname, route)
      : computeRootMatch(pathname); // use default "root" match

    if (match) {
      branch.push({ route, match });

      if (route.routes) {
        matchRoutes(route.routes, pathname, branch);
      }
    }

    return match;
  });

  return branch;
}

// isRoutesMatched filter error route page away and check if route matched.
export function isRoutesMatched(routes: IRouteBase[], pathname: string) {
  return (
    matchRoutes(
      routes.filter(({ name }) => name !== 'error'),
      pathname
    ).length > 0
  );
}
