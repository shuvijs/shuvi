import { ProjectContext } from '../../../../projectContext';

export default {
  content: (context: ProjectContext) =>
    context.polyfills.map(file => `import "${file}"`).join('\n')
};
