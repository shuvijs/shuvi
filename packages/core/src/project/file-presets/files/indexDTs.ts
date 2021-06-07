import fileSnippetUtil from '../../file-snippet-util';
import { ProjectContext } from '../../projectContext';

export default {
  name: 'index.d.js',
  content: (context: ProjectContext) =>
    fileSnippetUtil.definitionTSFile(
      Object.fromEntries(context.exports.entries()),
      '@shuvi/app'
    )
};
