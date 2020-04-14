// This utility is based on https://github.com/zertosh/htmlescape
// License: https://github.com/zertosh/htmlescape/blob/0527ca7156a524d256101bb310a9f970f63078ad/LICENSE

const JSON_ESCAPE_LOOKUP: { [match: string]: string } = {
  '&': '\\u0026',
  '>': '\\u003e',
  '<': '\\u003c',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

const JSON_ESCAPE_REGEX = /[&><\u2028\u2029]/g;

export function htmlEscapeJsonString(str: string) {
  return str.replace(JSON_ESCAPE_REGEX, (match) => JSON_ESCAPE_LOOKUP[match]);
}

const CONTENT_ESCAPE_LOOKUP: { [match: string]: string } = {
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#39;',
  '>': '&gt;',
  '<': '&lt;',
};

const CONTENT_ESCAPE_REGEX = /[&><\'\"]/g;

export function htmlEscapeContent(str: string) {
  return str.replace(
    CONTENT_ESCAPE_REGEX,
    (match) => CONTENT_ESCAPE_LOOKUP[match]
  );
}
