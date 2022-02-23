import { createFileWithoutName, fileUtils } from '@shuvi/service/lib/project';
import { ProjectContext } from '../../../../projectContext';

const { getModuleExport } = fileUtils;

export default (context: ProjectContext) =>
  createFileWithoutName({
    content: () => {
      return getModuleExport(context.platformModule);
    }
  });
