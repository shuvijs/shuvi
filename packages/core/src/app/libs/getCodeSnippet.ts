import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as babelTypes from '@babel/types';
import { ICodeSnippet } from '../types';

export function getCodeSnippet(content: string): ICodeSnippet {
  const ast = parse(content, {
    sourceType: 'module',
    plugins: ['jsx']
  }) as any;

  let importPaths: babelTypes.Statement[] = [];

  traverse(ast, {
    ImportDeclaration(path) {
      importPaths.push(path.node as babelTypes.ImportDeclaration);
      path.remove();
    }
  });

  const importAst: babelTypes.Program = {
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
