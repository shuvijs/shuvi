// @ts-nocheck

// eg: import(SOURCE) => Promise.resolve(require(SOURCE))
import syntax from '@babel/plugin-syntax-dynamic-import';

import {
  // PluginObj,
  types as BabelTypes,
  template
} from '@babel/core';
import { NodePath } from '@babel/traverse';

const buildImport = template(`
    Promise.resolve(require(SOURCE))
  `);

export default function ({ types: t }: { types: typeof BabelTypes }) {
  return {
    inherits: syntax,
    visitor: {
      Import(path: NodePath<BabelTypes.Import>) {
        const importArguments = path.parentPath.node.arguments;
        const isString =
          t.isStringLiteral(importArguments[0]) ||
          t.isTemplateLiteral(importArguments[0]);
        if (isString) {
          t.removeComments(importArguments[0]);
        }
        const newImport = buildImport({
          SOURCE: isString
            ? importArguments
            : t.templateLiteral(
                [
                  t.templateElement({ raw: '', cooked: '' }),
                  t.templateElement({ raw: '', cooked: '' }, true)
                ],
                importArguments
              )
        });
        path.parentPath.replaceWith(newImport);
      }
    }
  };
}
