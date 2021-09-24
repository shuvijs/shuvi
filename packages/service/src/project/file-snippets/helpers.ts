import { codeFrameColumns } from '@babel/code-frame';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as BabelTypes from '@babel/types';
interface ICodeSnippet {
  imports: string;
  body: string;
}

export function getCodeSnippet(content: string): ICodeSnippet {
  let ast: any;
  try {
    ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx']
    });
  } catch (error: any) {
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

export const getExportsContent = (
  exports: { [source: string]: string | string[] },
  stripFullPath: boolean = false
): string => {
  const statements: string[] = [];
  const sources = Object.keys(exports);

  for (let source of sources) {
    const exportContents = ([] as string[]).concat(exports[source]);

    // stripFullPath because type definition unable to read full path.
    if (stripFullPath) {
      source = source.substring(source.indexOf('node_modules'));
    }
    for (const exportContent of exportContents) {
      statements.push(`export ${exportContent} from "${source}"`);
    }
  }

  return statements.join('\n');
};
