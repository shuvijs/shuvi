import * as qs from 'query-string';
import { PathRecord, PartialPath, Path } from '../types';

export const trimTrailingSlashes = (path: string) => path.replace(/\/+$/, '');

export const normalizeSlashes = (path: string) => path.replace(/\/\/+/g, '/');

export const joinPaths = (paths: string[]) => normalizeSlashes(paths.join('/'));

export const splitPath = (path: string) => normalizeSlashes(path).split('/');

export function normalizeBase(base: string): string {
  if (!base) {
    base = '/';
  }
  // make sure there's the starting slash
  if (base.charAt(0) !== '/') {
    base = '/' + base;
  }
  // remove trailing slash
  return base.replace(/\/$/, '');
}

export function parseQuery(queryStr: string) {
  return qs.parse(queryStr);
}

export function pathToString(
  { pathname = '/', search = '', hash = '', query = {} }: PartialPath,
  basename?: string
): string {
  if (!search) {
    const queryString = qs.stringify(query);
    search = queryString ? `?${queryString}` : '';
  }
  const pathString = pathname + search + hash;
  if (basename) {
    return joinPaths([basename, pathString]);
  }
  return pathString;
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
export function resolvePath(to: PathRecord, fromPathname = '/'): Path {
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
        parsedPath.query = parseQuery(parsedPath.search);
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
      parsedPath.query = parseQuery(parsedPath.search);
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

/**
 * Strips off the base from the beginning of a location.pathname in a non-case-sensitive way.
 * If the base does not match at the beginning, null will be returned.
 *
 * @param pathname - location.pathname
 * @param base - base to strip off
 */
export function stripBase(pathname: string, base: string): string | null {
  if (!base || base === '/') return pathname;

  // no base or base is not found at the beginning
  if (!pathname.toLowerCase().startsWith(base.toLowerCase())) {
    return null;
  }
  return pathname.slice(base.length) || '/';
}
