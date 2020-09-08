import pathToRegexp, { Key, PathRegExp } from 'path-to-regexp';
import { IPathPattern, IPathMatch, IParams } from './types';

function compilePath(
  path: string,
  caseSensitive: boolean,
  end: boolean
): [PathRegExp, Key[]] {
  const keys: Key[] = [];

  const source = path.replace(/^\/*/, '/'); // Make sure it has a leading /
  const regexp = pathToRegexp(source, keys, { end, sensitive: caseSensitive });

  return [regexp, keys];
}

function safelyDecodeURIComponent(value: string, paramName: string) {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch (error) {
    console.warn(
      `The value for the URL param "${paramName}" will not be decoded because` +
        ` the string "${value}" is a malformed URL segment. This is probably` +
        ` due to a bad percent encoding (${error}).`
    );

    return value;
  }
}

export function matchPath(
  pattern: IPathPattern,
  pathname: string
): IPathMatch | null {
  if (typeof pattern === 'string') {
    pattern = { path: pattern };
  }

  let { path, caseSensitive = false, end = true } = pattern;

  let [matcher, keys] = compilePath(path, caseSensitive, end);

  const match = matcher.exec(pathname);

  if (!match) return null;

  let [matchedPathname, ...values] = match;

  let params = keys.reduce((memo, key, index) => {
    memo[key.name || '*'] = safelyDecodeURIComponent(
      values[index],
      String(key.name)
    );
    return memo;
  }, {} as IParams);

  return { path, pathname: matchedPathname, params };
}
