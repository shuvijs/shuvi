import qs from 'query-string';
import { To, PartialPath, Path } from '../types';

export const trimTrailingSlashes = (path: string) => path.replace(/\/+$/, '');

export const normalizeSlashes = (path: string) => path.replace(/\/\/+/g, '/');

export const joinPaths = (paths: string[]) => normalizeSlashes(paths.join('/'));

export const splitPath = (path: string) => normalizeSlashes(path).split('/');

export function pathToString({
  pathname = '/',
  search = '',
  hash = '',
  query = {}
}: PartialPath): string {
  search = search || qs.stringify(query);
  return pathname + search + hash;
}

function resolvePathname(toPathname: string, fromPathname: string): string {
  let segments = splitPath(trimTrailingSlashes(fromPathname));
  let relativeSegments = splitPath(toPathname);

  relativeSegments.forEach(segment => {
    if (segment === '..') {
      // Keep the root "" segment so the pathname starts at /
      if (segments.length > 1) segments.pop();
    } else if (segment !== '.') {
      segments.push(segment);
    }
  });

  return segments.length > 1 ? joinPaths(segments) : '/';
}

/**
 * Parses a string URL path into its separate pathname, search, and hash components.
 */
export function resolvePath(to: To, fromPathname = '/'): Path {
  let parsedPath: Path = {
    pathname: '',
    search: '',
    hash: '',
    query: {}
  };
  if (typeof to === 'string') {
    if (to) {
      let hashIndex = to.indexOf('#');
      if (hashIndex >= 0) {
        parsedPath.hash = to.substr(hashIndex);
        to = to.substr(0, hashIndex);
      }

      let searchIndex = to.indexOf('?');
      if (searchIndex >= 0) {
        parsedPath.search = to.substr(searchIndex);
        parsedPath.query = qs.parse(parsedPath.search);
        to = to.substr(0, searchIndex);
      }

      if (to) {
        parsedPath.pathname = to;
      }
    }
  } else {
    const path: PartialPath = to;
    (['pathname', 'search', 'hash', 'query'] as const).forEach(key => {
      const val = path[key];
      if (val != null) {
        // @ts-ignore
        parsedPath[key] = val;
      }
    });

    if (parsedPath.search) {
      parsedPath.query = qs.parse(parsedPath.search);
    } else {
      parsedPath.search = qs.stringify(parsedPath.query);
    }
  }

  const toPathname = parsedPath.pathname;
  parsedPath.pathname = toPathname
    ? resolvePathname(
        toPathname,
        toPathname.startsWith('/') ? '/' : fromPathname
      )
    : fromPathname;

  return parsedPath;
}
