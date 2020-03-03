export type HtmlAttrs = { innerHtml?: string } & {
  [x: string]: string | number | undefined | boolean;
};

export interface HtmlTag<TagNames = string> {
  tagName: TagNames;
  voidTag: boolean;
  attrs: HtmlAttrs;
  innerHTML?: string;
}

/**
 * All html tag elements which must not contain innerHTML
 * @see https://www.w3.org/TR/html5/syntax.html#void-elements
 */
const voidTags = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];

export function stringifyTag(tag: HtmlTag) {
  const attrNames = Object.keys(tag.attrs);
  const attrs: string[] = [];
  for (let index = 0; index < attrNames.length; index++) {
    const attributeName = attrNames[index];
    if (tag.attrs[attributeName] === false) {
      continue;
    }

    if (tag.attrs[attributeName] === true) {
      attrs.push(attributeName);
    } else {
      attrs.push(`${attributeName}="${tag.attrs[attributeName]}"`);
    }
  }

  const begin = `<${[tag.tagName].concat(attrs).join(" ")} ${
    tag.voidTag ? "/" : ""
  }>`;
  const inner = tag.innerHTML || "";
  const end = tag.voidTag ? "" : "</" + tag.tagName + ">";

  return `${begin}${inner}${end}`;
}

export function tag<T extends string>(
  tagName: T,
  attrs: HtmlAttrs,
  innerHTML?: string
): HtmlTag<T> {
  return {
    tagName: tagName,
    voidTag: voidTags.indexOf(tagName) !== -1,
    attrs: attrs || {},
    innerHTML
  };
}
