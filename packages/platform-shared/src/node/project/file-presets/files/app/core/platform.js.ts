import { defineFile } from '../../..';
import { fileUtils } from '@shuvi/service/project';
import { ProjectContext } from '../../../../projectContext';

export default (context: ProjectContext) =>
  defineFile({
    content: () => {
      return fileUtils.getModuleExport(context.platformModule);
    }
  });
