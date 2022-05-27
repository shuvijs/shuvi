import { createFileWithoutName, fileUtils } from '@shuvi/service/lib/project';
import { ProjectContext } from '../../../../projectContext';

const { getAllFiles, getFirstModuleExport } = fileUtils;

export default (context: ProjectContext) =>
  createFileWithoutName(() => {
    const { app } = context.userModule;
    const candidates = Array.isArray(app) ? app : [app];
    return {
      dependencies: candidates,
      content: () => {
        return getFirstModuleExport(getAllFiles(candidates), candidates, true);
      }
    };
  });
