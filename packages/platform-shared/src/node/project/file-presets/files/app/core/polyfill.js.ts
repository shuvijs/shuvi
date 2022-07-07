import { defineFile } from '../../..';
import { ProjectContext } from '../../../../projectContext';

export default (context: ProjectContext) =>
  defineFile({
    content: () => context.polyfills.map(file => `import "${file}"`).join('\n')
  });
