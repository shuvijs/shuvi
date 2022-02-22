import { createFileWithoutName } from '@shuvi/service/lib/project';
import { ProjectContext } from '../../../../projectContext';

export default (context: ProjectContext) =>
  createFileWithoutName({
    content: () => `export default ${context.runtimeConfigContent}`
  });
