import { createFileWithoutName } from '../../..';
import { getCodeSnippet } from '../../../file-utils';
import { ProjectContext } from '../../../projectContext';
import os from 'os';

export default createFileWithoutName({
  content: (context: ProjectContext) => {
    const codes = context.entryCodes;
    let imports = '';
    let body = '';
    for (let index = 0; index < codes.length; index++) {
      const code = codes[index];
      const snippet = getCodeSnippet(code);
      if (snippet.imports) {
        imports += `${snippet.imports}${os.EOL}`;
      }

      if (snippet.body) {
        body += `${snippet.body}${os.EOL}`;
      }
    }
    return `${imports}${os.EOL}${body}`;
  }
});