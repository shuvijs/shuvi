import { ICodeSnippet } from '../types';

const SPLIT_MARK = '//@code';

// TODO: optimize
export function getCodeSnippet(content: string): ICodeSnippet {
  const parts = content.split(SPLIT_MARK);
  let imports: string;
  let body: string;
  if (parts.length === 1) {
    imports = '';
    body = parts[0].trim();
  } else {
    imports = parts[0].trim();;
    body = parts[1].trim();;
  }

  return {
    imports,
    body
  };
}
