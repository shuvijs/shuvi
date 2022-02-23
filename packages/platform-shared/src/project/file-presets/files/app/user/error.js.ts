import { createFileWithoutName, fileUtils } from '@shuvi/service/lib/project';
import { ProjectContext } from '../../../../projectContext';

const { getAllFiles, getFisrtModuleExport } = fileUtils;

export default (context: ProjectContext) =>
  createFileWithoutName(() => {
    const { error } = context.userModule;
    const candidates = Array.isArray(error) ? error : [error];
    return {
      dependencies: candidates,
      content: () => {
        return getFisrtModuleExport(getAllFiles(candidates), candidates, true);
      }
    };
  });
