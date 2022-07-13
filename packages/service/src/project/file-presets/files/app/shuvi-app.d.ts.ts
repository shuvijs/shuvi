import { defineFile } from '../..';
import { ProjectContext } from '../../../projectContext';

export default defineFile({
  content: (context: ProjectContext) => {
    const types = context.typeDeclarationFiles;
    return types
      .map(file => {
        const isPath = file.startsWith('/') || file.startsWith('.');
        return isPath
          ? `/// <reference path="${file}" />`
          : `/// <reference types="${file}" />`;
      })
      .join('\n');
  }
});
