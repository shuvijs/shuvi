import { fileUtils } from '@shuvi/service/project';
import { removeExt } from '@shuvi/utils/file';
import { defineFile } from '../../..';
import { ProjectContext } from '../../../../projectContext';

const { getAllFiles, getFirstModuleExport } = fileUtils;

export default (context: ProjectContext) => {
  const { error } = context.userModule;
  const candidates = Array.isArray(error) ? error : [error];
  return defineFile({
    dependencies: candidates,
    content: () => {
      const noExtFiles = getAllFiles(candidates).map(file => removeExt(file));
      const noExtCandidates = candidates.map(file => removeExt(file));
      return getFirstModuleExport(noExtFiles, noExtCandidates, true);
    }
  });
};
