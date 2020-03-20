// Based on https://github.com/zeit/next.js
// License: https://github.com/zeit/next.js/blob/977bf8d9ebd2845241b8689317f36e4e487f39d0/license.md

import { HeadState, HeadItem } from "./types";

export default class HeadManager {
  private _pedningPromise: Promise<void> | null = null;
  private _head!: HeadState;

  constructor() {
    this.updateHead = this.updateHead.bind(this);
  }

  updateHead(head: HeadState) {
    this._head = head;

    if (this._pedningPromise) {
      return;
    }

    this._pedningPromise = Promise.resolve().then(() => {
      this._pedningPromise = null;
      this._doUpdateHead();
    });
  }

  private _doUpdateHead() {
    const tags: { [tagName: string]: HeadItem[] } = {};
    this._head.forEach(h => {
      const components = tags[h.tagName] || [];
      components.push(h);
      tags[h.tagName] = components;
    });

    this._updateTitle(tags.title ? tags.title[0] : null);

    const types = ["meta", "base", "link", "style", "script"];
    types.forEach(type => {
      this._updateElements(type, tags[type] || []);
    });
  }

  private _updateTitle(titleTag: HeadItem | null) {
    let title = "";
    if (titleTag) {
      title = titleTag.attrs.textContent || "";
    }
    if (title !== document.title) document.title = title;
  }

  private _updateElements(type: string, tags: HeadItem[]) {
    const headEl = document.getElementsByTagName("head")[0];
    const headCountEl: HTMLMetaElement | null = headEl.querySelector(
      "meta[name=shuvi-head-count]"
    );
    if (!headCountEl) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Warning: shuvi-head-count is missing.");
      }
      return;
    }

    const headCount = Number(headCountEl.content);
    const oldTags: Element[] = [];

    let curEle = headCountEl.previousElementSibling;
    for (let i = 0; i < headCount; i++) {
      if (!curEle) {
        continue;
      }

      if (curEle.tagName.toLowerCase() === type) {
        oldTags.push(curEle);
      }
      curEle = curEle.previousElementSibling;
    }

    const newTags = tags.map(tagToDOM).filter(newTag => {
      for (let k = 0, len = oldTags.length; k < len; k++) {
        const oldTag = oldTags[k];
        if (oldTag.isEqualNode(newTag)) {
          oldTags.splice(k, 1);
          return false;
        }
      }
      return true;
    });

    oldTags.forEach(t => t.parentNode!.removeChild(t));
    newTags.forEach(t => headEl.insertBefore(t, headCountEl));
    headCountEl.content = (
      headCount -
      oldTags.length +
      newTags.length
    ).toString();
  }
}

function tagToDOM({ tagName, attrs, innerHTML }: HeadItem) {
  const el = document.createElement(tagName);
  for (const a in attrs) {
    if (!Object.prototype.hasOwnProperty.call(attrs, a)) continue;
    if (a === "textContent") continue;

    // we don't render undefined props to the DOM
    if (attrs[a] === undefined) continue;

    el.setAttribute(a.toLowerCase(), attrs[a] as any);
  }

  const { textContent } = attrs;
  if (innerHTML) {
    el.innerHTML = innerHTML;
  } else if (textContent) {
    el.textContent = textContent;
  }
  return el;
}
