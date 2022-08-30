import { codeFrameColumns } from '@babel/code-frame';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as BabelTypes from '@babel/types';

export const getExports = (content: string) => {
  let ast: any;
  try {
    ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch (error: any) {
    error.message = [
      error.message,
      '',
      codeFrameColumns(content, { start: error.loc }, { highlightCode: true })
    ].join('\n');
    throw error;
  }

  const exports: string[] = [];

  traverse(ast, {
    ExportDeclaration(path) {
      if (path.type !== 'ExportNamedDeclaration') {
        return;
      }

      const { declaration, specifiers } =
        path.node as BabelTypes.ExportNamedDeclaration;

      if (!declaration && specifiers.length) {
        specifiers.forEach(item => {
          if (BabelTypes.isIdentifier(item.exported)) {
            exports.push(item.exported.name);
          }
        });
      } else if (BabelTypes.isFunctionDeclaration(declaration)) {
        if (declaration.id) {
          exports.push(declaration.id.name);
        }
      } else if (BabelTypes.isVariableDeclaration(declaration)) {
        declaration.declarations.forEach(d => {
          if (BabelTypes.isIdentifier(d.id)) {
            exports.push(d.id.name);
          }
        });
      }
    }
  });
  return exports;
};
