import { ProjectContext } from '../../../projectContext';

export default {
  content: (context: ProjectContext) =>
    `export default ${context.runtimeConfigContent}`
};
