// Based on https://github.com/zeit/next.js
// License: https://github.com/zeit/next.js/blob/977bf8d9ebd2845241b8689317f36e4e487f39d0/license.md

import { HeadState, HeadItem } from './types';
import { SHUVI_HEAD_ATTRIBUTE } from './head';

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
      (tags[h.tagName] || (tags[h.tagName] = [])).push(h);
    });

    if (tags.title) {
      this._updateTitle(tags.title[0]);
    }

    const types = ['meta', 'base', 'link', 'style', 'script'];
    types.forEach(type => {
      this._updateElements(type, tags[type] || []);
    });
  }

  private _updateTitle({ attrs }: HeadItem) {
    const title = attrs.textContent || '';
    if (title !== document.title) document.title = title;
    const titleEle = document.getElementsByTagName('title')[0];
    if (titleEle) {
      assignAttributes(titleEle, attrs);
    }
  }

  private _updateElements(type: string, tags: HeadItem[]) {
    const headEl = document.getElementsByTagName('head')[0];
    const oldNodes = headEl.querySelectorAll(
      `${type}[${SHUVI_HEAD_ATTRIBUTE}='true']`
    );
    const oldTags: Element[] = Array.prototype.slice.call(oldNodes);

    let divideElement: Element | null = null;
    if (oldTags.length) {
      divideElement = oldTags[oldTags.length - 1].nextElementSibling;
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
    newTags.forEach(t => {
      if (divideElement) {
        headEl.insertBefore(t, divideElement);
      } else {
        headEl.appendChild(t);
      }
    });
  }
}

function assignAttributes(el: HTMLElement, attrs: HeadItem['attrs']) {
  for (const a in attrs) {
    if (!Object.prototype.hasOwnProperty.call(attrs, a)) continue;
    if (a === 'textContent') continue;

    // we don't render undefined props to the DOM
    if (attrs[a] === undefined) continue;

    el.setAttribute(a.toLowerCase(), attrs[a] as any);
  }
}

function tagToDOM({ tagName, attrs, innerHTML }: HeadItem) {
  const el = document.createElement(tagName);

  assignAttributes(el, attrs);

  const { textContent } = attrs;
  if (innerHTML) {
    el.innerHTML = innerHTML;
  } else if (textContent) {
    el.textContent = textContent;
  }
  return el;
}
