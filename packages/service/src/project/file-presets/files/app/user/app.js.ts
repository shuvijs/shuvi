import { ProjectContext } from '../../../../projectContext';
import { createFileWithoutName, fileUtils } from '../../../..';

const { getAllFiles, getFisrtModuleExport } = fileUtils;

export default createFileWithoutName<ProjectContext>(context => {
  const { app } = context.userModule;
  const candidates = Array.isArray(app) ? app : [app];
  return {
    dependencies: candidates,
    content: () => {
      return getFisrtModuleExport(getAllFiles(candidates), candidates, true);
    }
  };
});
