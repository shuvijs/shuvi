import { defineFile } from '../..';
import { ProjectContext } from '../../../projectContext';

export default defineFile({
  content: (context: ProjectContext) => {
    const types = context.typeDeclarationFiles;
    return types.map(file => `/// <reference types="${file}" />`).join('\n');
  }
});
