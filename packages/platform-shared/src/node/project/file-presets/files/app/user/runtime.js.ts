import { createFileWithoutName, fileUtils } from '@shuvi/service/lib/project';
import { ProjectContext } from '../../../../projectContext';

const { getAllFiles, getFirstModuleExport } = fileUtils;

export default (context: ProjectContext) => {
  const { runtime } = context.userModule;
  const candidates = Array.isArray(runtime) ? runtime : [runtime];
  return createFileWithoutName({
    dependencies: candidates,
    content: () => {
      return getFirstModuleExport(getAllFiles(candidates), candidates);
    }
  });
};
