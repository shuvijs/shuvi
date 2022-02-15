import { ProjectContext } from '../../../../projectContext';
import { createFileWithoutName, fileUtils } from '../../../..';

const { getAllFiles, getFisrtModuleExport } = fileUtils;

export default createFileWithoutName<ProjectContext>(context => {
  const { runtime } = context.userModule;
  const candidates = Array.isArray(runtime) ? runtime : [runtime];
  return {
    dependencies: candidates,
    content: () => {
      return getFisrtModuleExport(getAllFiles(candidates), candidates);
    }
  };
});
