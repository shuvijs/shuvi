import invariant from '@shuvi/utils/lib/invariant';

const dynamicMatchAllRegex = /\[\[(.+?)\]\]/g;
const dynamicMatchPartRegex = /\[(.+?)\]/g;

export default function parseDynamicPath(normalizedRoute: string): string {
  invariant(
    normalizedRoute.length >= 1,
    'parseDynamicPath param normalizedRoute length should not >= 1'
  );
  invariant(
    !checkSpecialRegexChars(normalizedRoute),
    'filePath should not be special regex chars: |\\{}()^$+*?'
  );
  const parameterizedRoute = normalizedRoute
    .slice(1)
    .split('/')
    .map(segment => {
      let result = '';
      result = segment.replace(dynamicMatchAllRegex, function (
        matchString,
        ...matchArr
      ) {
        return parseMatchRepeat(matchArr[0], true);
      });
      result = result.replace(dynamicMatchPartRegex, function (
        matchString,
        ...matchArr
      ) {
        return parseMatchRepeat(matchArr[0], false);
      });
      return `/${result}`;
    })
    .join('');

  return parameterizedRoute;
}

function parseMatchRepeat(param: string, optional: boolean): string {
  const repeat = param.startsWith('...');
  if (repeat) {
    param = param.slice(3);
  }
  return repeat
    ? optional
      ? `:${param}*`
      : `:${param}+`
    : `:${param}${optional ? '?' : ''}`;
}

function checkSpecialRegexChars(string: string): boolean {
  return /[|\\{}()^$+*?]/g.test(string);
}
