import { ProjectContext } from '../../projectContext';

export default {
  name: 'entry.js',
  content: (context: ProjectContext) => context.entryFileContent
};
