// Based on https://github.com/umijs/umi/blob/83301f25a420daff69ca51a179134c6b1612f5b6/packages/babel-plugin-auto-css-modules/src/index.ts
// License: https://github.com/umijs/umi/blob/83301f25a420daff69ca51a179134c6b1612f5b6/LICENSE

import { NodePath, Visitor, types as BabelTypes } from '@babel/core';
import { extname } from 'path';

export interface IOpts {
  flag?: string;
}

const CSS_EXTNAMES = ['.css', '.less', '.sass', '.scss'];

export default function () {
  return {
    visitor: {
      ImportDeclaration(
        path: NodePath<BabelTypes.ImportDeclaration>,
        { opts }: { opts: IOpts }
      ) {
        const {
          specifiers,
          source,
          source: { value },
        } = path.node;
        if (specifiers.length && CSS_EXTNAMES.includes(extname(value))) {
          if (value.indexOf('?') >= 0) {
            source.value = `${value}&${opts.flag || 'cssmodules'}`;
          } else {
            source.value = `${value}?${opts.flag || 'cssmodules'}`;
          }
        }
      },
    } as Visitor,
  };
}
