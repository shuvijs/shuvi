import { createFileWithoutName } from '../../..';
import { ProjectContext } from '../../../projectContext';

export default createFileWithoutName({
  content: (context: ProjectContext) => context.entryWrapperContent
});
