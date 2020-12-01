import { Runtime } from '@shuvi/types';
import { htmlEscapeContent } from '@shuvi/utils/lib/htmlescape';

/**
 * All html tag elements which must not contain innerHTML
 * @see https://www.w3.org/TR/html5/syntax.html#void-elements
 */
const voidTags = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
];

// the result will have an extra leading space
export function stringifyAttrs(attrs: Runtime.IHtmlAttrs): string {
  const attrNames = Object.keys(attrs);
  const res: string[] = [''];
  for (let index = 0; index < attrNames.length; index++) {
    const attributeName = attrNames[index];

    if (attributeName === 'textContent') continue;
    if (attrs[attributeName] === false) {
      continue;
    }

    if (attrs[attributeName] === true) {
      res.push(htmlEscapeContent(attributeName));
    } else {
      res.push(
        `${htmlEscapeContent(attributeName)}="${htmlEscapeContent(
          attrs[attributeName]?.toString() || ''
        )}"`
      );
    }
  }

  return res.join(' ');
}

export function stringifyTag(tag: Runtime.IHtmlTag) {
  const attr = stringifyAttrs(tag.attrs);
  const voidTag = voidTags.indexOf(tag.tagName) !== -1;

  let res: string = `<${tag.tagName}${attr}`;
  if (voidTag) {
    return `${res} />`;
  }

  res += '>';
  res +=
    tag.innerHTML ||
    (tag.attrs.textContent ? htmlEscapeContent(tag.attrs.textContent) : '');
  res += '</' + tag.tagName + '>';
  return res;
}

export function tag<T extends string>(
  tagName: T,
  attrs: Runtime.IHtmlAttrs,
  innerHTML?: string
): Runtime.IHtmlTag<T> {
  return {
    tagName: tagName,
    attrs: attrs || {},
    innerHTML
  };
}
