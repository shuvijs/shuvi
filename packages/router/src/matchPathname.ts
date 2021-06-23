import { IPathPattern, IPathMatch, IParams } from './types';
import { tokensToParser } from './pathParserRanker';
import { tokenizePath } from './pathTokenizer';

function safelyDecodeURIComponent(
  value: string,
  paramName: string,
  optional?: boolean
) {
  try {
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

function compileToParser(
  path: string,
  caseSensitive: boolean,
  end: boolean
) {
  const source = path ? path.replace(/^\/*/, '/') : path; // Make sure it has a leading /
  return tokensToParser(tokenizePath(source), { end, sensitive: caseSensitive });
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

  const pathParser = compileToParser(path, caseSensitive, end);

  const match = pathParser.parse(pathname);

  if (!match) return null;

  const { keys = [] } = pathParser;

  const params = (keys).reduce((memo, key, index) => {
    const keyName = key.name;
    memo[keyName] = safelyDecodeURIComponent(
      String(match[keyName]),
      String(keyName),
      key.optional
    );
    return memo;
  }, {} as IParams);

  return { path, pathname, params };
}
