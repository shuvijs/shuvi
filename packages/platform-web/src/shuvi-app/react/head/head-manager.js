// Based on https://github.com/zeit/next.js
// License: https://github.com/zeit/next.js/blob/977bf8d9ebd2845241b8689317f36e4e487f39d0/license.md
import { SHUVI_HEAD_ATTRIBUTE } from './head';
export default class HeadManager {
  constructor() {
    this._pedningPromise = null;
    this.updateHead = this.updateHead.bind(this);
  }
  updateHead(head) {
    this._head = head;
    if (this._pedningPromise) {
      return;
    }
    this._pedningPromise = Promise.resolve().then(() => {
      this._pedningPromise = null;
      this._doUpdateHead();
    });
  }
  _doUpdateHead() {
    const tags = {};
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
  _updateTitle({ attrs }) {
    const title = attrs.textContent || '';
    if (title !== document.title) document.title = title;
    const titleEle = document.getElementsByTagName('title')[0];
    if (titleEle) {
      assignAttributes(titleEle, attrs);
    }
  }
  _updateElements(type, tags) {
    const headEl = document.getElementsByTagName('head')[0];
    const oldNodes = headEl.querySelectorAll(
      `${type}[${SHUVI_HEAD_ATTRIBUTE}='true']`
    );
    const oldTags = Array.prototype.slice.call(oldNodes);
    let divideElement = null;
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
    oldTags.forEach(t => t.parentNode.removeChild(t));
    newTags.forEach(t => {
      if (divideElement) {
        headEl.insertBefore(t, divideElement);
      } else {
        headEl.appendChild(t);
      }
    });
  }
}
function assignAttributes(el, attrs) {
  for (const a in attrs) {
    if (!Object.prototype.hasOwnProperty.call(attrs, a)) continue;
    if (a === 'textContent') continue;
    // we don't render undefined props to the DOM
    if (attrs[a] === undefined) continue;
    el.setAttribute(a.toLowerCase(), attrs[a]);
  }
}
function tagToDOM({ tagName, attrs, innerHTML }) {
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
