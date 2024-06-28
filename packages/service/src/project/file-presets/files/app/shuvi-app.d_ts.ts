import { defineFile } from '../..';
import { ProjectContext } from '../../../projectContext';

export default defineFile({
  content: (context: ProjectContext) => {
    const types = context.typeDeclarationFiles;
    console.log('[Michael] types', types);
    return types
      .map(file => {
        const isPath = /\.d\.ts$/.test(file) || file.startsWith('.');
        return isPath
          ? `/// <reference path="${file}" />`
          : `/// <reference types="${file}" />`;
      })
      .join('\n');
  }
});
