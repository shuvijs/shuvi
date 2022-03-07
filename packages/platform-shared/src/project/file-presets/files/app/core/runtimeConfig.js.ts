import { createFileWithoutName } from '@shuvi/service/lib/project';
import { getPublicRuntimeConfig } from '../../../../../lib/getPublicRuntimeConfig';
import { ProjectContext } from '../../../../projectContext';

export default (context: ProjectContext) =>
  createFileWithoutName({
    content: () => {
      const runtimeConfigContent = Object.keys(context.runtimeConfig)
        ? JSON.stringify(getPublicRuntimeConfig(context.runtimeConfig))
        : null;
      return `export default ${runtimeConfigContent}`;
    }
  });
