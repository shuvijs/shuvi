import { ProjectContext } from '../../../../projectContext';
import { createFileWithoutName, fileUtils } from '../../../..';

const { getAllFiles, getFisrtModuleExport } = fileUtils;

export default createFileWithoutName<ProjectContext>(context => {
  const { error } = context.userModule;
  const candidates = Array.isArray(error) ? error : [error];
  return {
    dependencies: candidates,
    content: () => {
      return getFisrtModuleExport(getAllFiles(candidates), candidates, true);
    }
  };
});
