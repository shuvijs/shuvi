import { defineFile } from '../../..';
import { getPublicRuntimeConfig } from '../../../../../../runtime/runtimeConfig';
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
