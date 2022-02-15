import { ProjectContext } from '../../../../projectContext';
import { createFileWithoutName, fileUtils } from '../../../..';

const { getModuleExport } = fileUtils;

export default createFileWithoutName<ProjectContext>(context => {
  const platform = context.platformModule;
  return {
    content: () => {
      return getModuleExport(platform);
    }
  };
});
