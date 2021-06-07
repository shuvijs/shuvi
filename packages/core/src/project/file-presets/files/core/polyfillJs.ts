import { ProjectContext } from '../../../projectContext';

export default {
  name: 'core/polyfill.js',
  content: (context: ProjectContext) =>
    context.polyfills.map(file => `import "${file}"`).join('\n')
};
