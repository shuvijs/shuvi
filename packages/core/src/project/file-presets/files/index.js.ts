import fileSnippetUtil from '../../file-snippet-util';
import { ProjectContext } from '../../projectContext';

export default {
  content: (context: ProjectContext) =>
    fileSnippetUtil.moduleExport(Object.fromEntries(context.exports.entries()))
};
