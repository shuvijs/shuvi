import * as path from 'path';
import * as fs from 'fs';
import { normalizeRoutePath } from '@shuvi/platform-shared/node/route/helpers';
import { rankRouteBranches } from '@shuvi/router';
// Cache for fs.lstatSync lookup.
// Prevent multiple blocking IO requests that have already been calculated.
const fsLstatSyncCache = {} as Record<string, fs.Stats>;
const fsLstatSync = (source: string) => {
  fsLstatSyncCache[source] = fsLstatSyncCache[source] || fs.lstatSync(source);
  return fsLstatSyncCache[source];
};

/**
 * Checks if the source is a directory.
 */
function isDirectory(source: string) {
  return fsLstatSync(source).isDirectory();
}

/**
 * Checks if the source is a directory.
 */
function isSymlink(source: string) {
  return fsLstatSync(source).isSymbolicLink();
}

// Cache for fs.readdirSync lookup.
// Prevent multiple blocking IO requests that have already been calculated.
const fsReadDirSyncCache = {} as Record<string, string[]>;

/**
 * Recursively parse directory for page URLs.
 */
function parseUrlForPages(urlprefix: string, directory: string) {
  fsReadDirSyncCache[directory] =
    fsReadDirSyncCache[directory] || fs.readdirSync(directory);
  const res = [] as string[];
  fsReadDirSyncCache[directory].forEach(fname => {
    // TODO: this should account for all page extensions
    // not just js(x) and ts(x)
    if (/(\.(j|t)sx?)$/.test(fname)) {
      if (/^page(\.(j|t)sx?)$/.test(fname)) {
        res.push(`${urlprefix}${fname.replace(/^(page\.(j|t)sx?)$/, '')}`);
      }
      res.push(`${urlprefix}${fname.replace(/(page\.(j|t)sx?)$/, '')}`);
    } else {
      const dirPath = path.join(directory, fname);
      if (isDirectory(dirPath) && !isSymlink(dirPath)) {
        res.push(...parseUrlForPages(urlprefix + fname + '/', dirPath));
      }
    }
  });
  return res;
}

/**
 * Takes a URL and does the following things.
 *  - Replaces `index.html` with `/`
 *  - Makes sure all URLs are have a trailing `/`
 *  - Removes query string
 */
export function normalizeURL(url: string) {
  if (!url) {
    return;
  }
  url = url.split('?')[0];
  url = url.split('#')[0];
  url = url = url.replace(/(\/index\.html)$/, '/');
  // Empty URLs should not be trailed with `/`, e.g. `#heading`
  if (url === '') {
    return url;
  }
  url = url.endsWith('/') ? url : url + '/';
  return url;
}

/**
 * Gets the possible URLs from a directory.
 */
export function getUrlFromPagesDirectories(
  urlPrefix: string,
  directories: string[]
) {
  const routes = Array.from(
    // De-duplicate similar pages across multiple directories.
    new Set(
      directories
        .map(directory => parseUrlForPages(urlPrefix, directory))
        .flat()
    )
  ).map(urlReg => {
    return normalizeRoutePath(urlReg);
  });
  return rankRouteBranches(routes.map(str => [str]))
    .flat()
    .map(str => ({ path: str }));
}

export function execOnce<TArgs extends any[], TResult extends unknown>(
  fn: (...args: TArgs) => TResult
): (...args: TArgs) => TResult {
  let used = false;
  let result: TResult;

  return (...args: TArgs) => {
    if (!used) {
      used = true;
      result = fn(...args);
    }
    return result;
  };
}

// 0 is the exact match
export const THRESHOLD = 1;

// the minimum number of operations required to convert string a to string b.
export function minDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  if (m < n) {
    return minDistance(b, a);
  }

  if (n === 0) {
    return m;
  }

  let previousRow = Array.from({ length: n + 1 }, (_, i) => i);

  for (let i = 0; i < m; i++) {
    const s1 = a[i];
    let currentRow = [i + 1];
    for (let j = 0; j < n; j++) {
      const s2 = b[j];
      const insertions = previousRow[j + 1] + 1;
      const deletions = currentRow[j] + 1;
      const substitutions = previousRow[j] + Number(s1 !== s2);
      currentRow.push(Math.min(insertions, deletions, substitutions));
    }
    previousRow = currentRow;
  }
  return previousRow[previousRow.length - 1];
}
