import { defineFile } from '../../..';
import { getPublicRuntimeConfig } from '../../../../../../shared/runtimeConfig';
import { ProjectContext } from '../../../../projectContext';

export default (context: ProjectContext) =>
  defineFile({
    content: () => {
      const runtimeConfigContent = getPublicRuntimeConfig()
        ? JSON.stringify(getPublicRuntimeConfig())
        : null;
      return `export default ${runtimeConfigContent}`;
    }
  });
