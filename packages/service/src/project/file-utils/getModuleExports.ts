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
      if (path.type === 'ExportNamedDeclaration') {
        const node = path.node as BabelTypes.ExportNamedDeclaration;
        const declarations = (
          node.declaration as BabelTypes.VariableDeclaration
        ).declarations;
        declarations.forEach(d => {
          const name = (d.id as BabelTypes.Identifier).name;
          if (name) {
            exports.push(name);
          }
        });
      }
    }
  });
  return exports;
};
