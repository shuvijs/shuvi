import { codeFrameColumns } from '@babel/code-frame';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as BabelTypes from '@babel/types';
import { ICodeSnippet } from '../types';

export function getCodeSnippet(content: string): ICodeSnippet {
  let ast: BabelTypes.File;
  try {
    ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx']
    });
  } catch (error) {
    error.message = [
      error.message,
      '',
      codeFrameColumns(content, { start: error.loc }, { highlightCode: true })
    ].join('\n');
    throw error;
  }

  let importPaths: BabelTypes.Statement[] = [];

  traverse(ast, {
    ImportDeclaration(path) {
      importPaths.push(path.node as BabelTypes.ImportDeclaration);
      path.remove();
    }
  });

  const importAst: BabelTypes.Program = {
    type: 'Program',
    body: importPaths,
    directives: [],
    sourceType: 'module',
    interpreter: null,
    sourceFile: '',
    leadingComments: null,
    end: null,
    innerComments: null,
    loc: null,
    start: null,
    trailingComments: null
  };

  const bodyAst = ast;

  const generateOpt = {
    compact: true
  };

  return {
    // @ts-ignore
    imports: generate(importAst, generateOpt).code,
    body: generate(bodyAst, generateOpt).code
  };
}
