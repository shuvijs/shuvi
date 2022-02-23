import { createFileWithoutName, fileUtils } from '@shuvi/service/lib/project';
import { ProjectContext } from '../../../../projectContext';

const { getAllFiles, getFisrtModuleExport } = fileUtils;

export default (context: ProjectContext) =>
  createFileWithoutName(() => {
    const { runtime } = context.userModule;
    const candidates = Array.isArray(runtime) ? runtime : [runtime];
    return {
      dependencies: candidates,
      content: () => {
        return getFisrtModuleExport(getAllFiles(candidates), candidates);
      }
    };
  });
