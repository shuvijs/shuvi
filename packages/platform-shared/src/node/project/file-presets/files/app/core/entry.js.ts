import { fileUtils } from '@shuvi/service/project';
import { defineFile } from '../../..';
import { ProjectContext } from '../../../../projectContext';
import * as os from 'os';

export default (context: ProjectContext) =>
  defineFile({
    content: () => {
      const codes = context.entryCodes;
      let imports = '';
      let body = '';
      for (let index = 0; index < codes.length; index++) {
        const code = codes[index];
        const snippet = fileUtils.getCodeSnippet(code);
        if (snippet.imports) {
          imports += `${snippet.imports}${os.EOL}`;
        }

        if (snippet.body) {
          body += `${snippet.body}${os.EOL}`;
        }
      }

      const content = `${imports}${os.EOL}${body}`;
      if (content.trim() === '') {
        return '// empty entry';
      } else {
        return content;
      }
    }
  });
