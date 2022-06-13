import { createFileWithoutName, fileUtils } from '@shuvi/service/lib/project';
import { ProjectContext } from '../../../../projectContext';

const { getAllFiles, getFirstModuleExport } = fileUtils;

export default (context: ProjectContext) => {
  const { error } = context.userModule;
  const candidates = Array.isArray(error) ? error : [error];
  return createFileWithoutName({
    dependencies: candidates,
    content: () => {
      return getFirstModuleExport(getAllFiles(candidates), candidates, true);
    }
  });
};
