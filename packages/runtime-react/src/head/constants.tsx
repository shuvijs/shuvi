import React from 'react';
import { IHtmlTag } from '@shuvi/types/src/runtime';
import { SHUVI_HEAD_ATTRIBUTE } from './head';

export const DEFAULT_HEADS = [
  <meta charSet="utf-8" key="charSet"></meta>,
  <meta
    key="viewport"
    name="viewport"
    content="width=device-width,minimum-scale=1,initial-scale=1"
  ></meta>
];

// temporary for SPA fix
export const DEFAULT_HEADS_TAGS: IHtmlTag<any>[] = [
  {
    tagName: 'meta',
    attrs: {
      charset: 'utf-8',
      [SHUVI_HEAD_ATTRIBUTE]: 'true'
    }
  },
  {
    tagName: 'meta',
    attrs: {
      name: 'viewport',
      content: 'width=device-width,minimum-scale=1,initial-scale=1',
      [SHUVI_HEAD_ATTRIBUTE]: 'true'
    }
  }
];
