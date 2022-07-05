import { IPathPattern, IPathMatch, IParams } from './types';
import { PathParserOptions, tokensToParser } from './pathParserRanker';
import { tokenizePath } from './pathTokenizer';

function safelyDecodeURIComponent(
  value: string[] | string,
  paramName: string,
  optional?: boolean
) {
  try {
    if (Array.isArray(value)) {
      return value.map(item => {
        return decodeURIComponent(item.replace(/\+/g, ' '));
      });
    }
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch (error) {
    if (!optional) {
      console.warn(
        `The value for the URL param "${paramName}" will not be decoded because` +
          ` the string "${value}" is a malformed URL segment. This is probably` +
          ` due to a bad percent encoding (${error}).`
      );
    }

    return value;
  }
}

/**
 * match pathname, online link https://paths.esm.dev/?p=AAMeJSyAwR4UbFDAFxAcAGAIJnMCo0SmCHGYBdyBsATSBUQBsAPABAwxsAHeGVJwuLlARA..#
 * @param pattern
 * @param pathname
 */
export function matchPathname(
  pattern: IPathPattern,
  pathname: string
): IPathMatch | null {
  if (typeof pattern === 'string') {
    pattern = { path: pattern };
  }

  const { path, caseSensitive = false, end = true } = pattern;

  const pathParser = tokensToParser(tokenizePath(path), {
    strict: false,
    end,
    sensitive: caseSensitive
  });

  const matchResult = pathParser.parse(pathname);

  if (!matchResult) return null;

  const { keys = [] } = pathParser;

  const { match, params } = matchResult;

  const safelyDecodedParams = keys.reduce((memo, key, index) => {
    const keyName = key.name;
    memo[keyName] = safelyDecodeURIComponent(
      params[keyName],
      String(keyName),
      key.optional
    );
    return memo;
  }, {} as IParams);

  return { path, pathname: match, params: safelyDecodedParams };
}

/**
 * stringify path to string by params and options
 * @param path
 * @param params
 * @param options
 */
export function matchStringify(
  path: string,
  params: IParams,
  options?: PathParserOptions
) {
  const pathParser = tokensToParser(tokenizePath(path), options);

  return pathParser.stringify(params);
}
